const SavneExportGenerator = require("./SavneExportGenerator");

class savneLiquibaseGenerator {
    constructor () {
    }
    getPreferences () {
        return {
            author: app.preferences.get('savne.liquibaseGenerator.author'),
            indentSpaces: app.preferences.get('savne.liquibaseGenerator.indentSpaces'),
            cascadeConstraints: app.preferences.get('savne.liquibaseGenerator.cascadeConstraints')
        }
    }

    export(){
        let preferences = this.getPreferences()
        if(preferences.author.length===0){
            window.alert("Invalid author, please change it in Configure/Savne Liquibase/Author")
            return
        }

        app.elementPickerDialog.showDialog('Select a project to generate DDL for', null, null).then(function ({buttonId, returnValue}) {
            if (buttonId !== 'ok') {
                return
            }

            let export_element = returnValue


            let path_destination = app.dialogs.showOpenDialog(
                'Select the folder where your php files will be exported', null, null,
                {properties: ['openFile', 'openDirectory']}
            );

            var options = [
                { text: "Xml", value: "xml" },
                { text: "Json", value: "json" },
                { text: "Sql", value: "sql" }
            ]

            app.dialogs.showSelectRadioDialog("Choose the migrations format", options).then(function ({buttonId, returnValue}) {
                if (buttonId !== 'ok') {
                    return
                }

                let savneExportGenerator= new SavneExportGenerator.SavneExportGenerator(path_destination, returnValue, preferences, returnValue);

                if(export_element instanceof type.ERDDataModel){

                    savneExportGenerator.generateModel(export_element)
                    window.alert("Data model migration exported in "+path_destination)

                }else if(export_element instanceof type.ERDEntity){

                    savneExportGenerator.generateTable(export_element)
                    window.alert("Table migration exported in "+path_destination)

                }else{
                    window.alert("Please select a valid Data Model or Table")
                }

            })

        })
    }

    configure(){
        app.commands.execute('application:preferences', 'savne')
    }

    init () {
        app.commands.register('Savne-Liquibase:ExportMigrations', this.export.bind(this))
        app.commands.register('Savne-Liquibase:Configure', this.configure.bind(this))
    }
}
exports.new = savneLiquibaseGenerator;