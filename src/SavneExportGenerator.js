const SavneLiquibaseXmlExporter = require("./SavneLiquibaseXmlExporter");
const SavneLiquibaseJsonExporter = require("./SavneLiquibaseJsonExporter");
const SavneLiquibaseSqlExporter = require("./SavneLiquibaseSqlExporter");
class SavneExportGenerator {
    constructor (path_destination, element, preferences, export_format) {
        this.preferences = preferences
        this.path_destination = path_destination
        this.file_id = this.getDate()
        this.tables = []
        this.export_format = export_format
    }

    generateModel(model){
        let lg= this
        model.ownedElements.forEach(function(table){
            if(table.columns !== undefined){
                lg.tables.push(table)
            }
        })

        this.orderTables()

        this.resolveIdField()

        let exporter = this.createExporter()
        exporter.writeDataModel(this.tables)
    }

    createExporter(){

        let exporter

        switch (this.export_format) {
            case 'xml':
                exporter = SavneLiquibaseXmlExporter;
                break
            case 'json':
                exporter = SavneLiquibaseJsonExporter;
                break
            case 'sql':
                exporter = SavneLiquibaseSqlExporter;
                break
            default:
                window.alert("Invalid export format")
                return
        }

        return new exporter.export(
            this.path_destination,
            this.file_id,
            this.preferences
        )
    }

    orderTables(){
        let lg = this
        let is_tables_ready=true
        do {
            is_tables_ready=true
            let index = 0
            this.tables.forEach(function (table){
                let last_tables = lg.tables.slice(0, index);
                table.columns.forEach(function(column){
                    if(column.foreignKey){
                        const is_table_before = last_tables.some((lastTable) => {
                            return lastTable.name === column.referenceTo._parent.name;
                        });
                        if(!is_table_before){
                            lg.tables.push(lg.tables[index])
                            lg.tables.splice(index, 1)
                            is_tables_ready=false
                        }
                    }
                })
                index++
            })
        }while(!is_tables_ready);
    }

    resolveIdField(){
        for(let i=0;i<this.tables.length;i++){
            let file_id_string = this.file_id.toString()
            if((file_id_string.substring(file_id_string.length - 2))==="00"){
                this.file_id-=41
            }else{
                this.file_id--
            }
        }
    }

    generateTable(table){
        let exporter = this.createExporter(this.export_format)
        exporter.writeTable(table)
    }

    getDate(){
        let date = new Date()
        let year = date.getFullYear()
        let month = String(date.getMonth() + 1).padStart(2, '0')
        let day = String(date.getDate()).padStart(2, '0')
        let hour = String(date.getHours()).padStart(2, '0')
        let minute = String(date.getMinutes()).padStart(2, '0')

        return`${year}${month}${day}${hour}${minute}`
    }
}
exports.SavneExportGenerator = SavneExportGenerator;