const writeFile = require("./writer");

class SavneLiquibaseJsonExporter {

    constructor (path_destination, file_id, preferences) {
        this.path_destination = path_destination
        this.preferences = preferences
        this.file_id=file_id
        this.foreign_key_columns = []
    }
    writeDataModel(tables){
        let lg = this
        tables.forEach(function (table) {
            lg.writeTable(table)
        })
    }

    writeTable(table){
        this.writer = new writeFile.Writer(this.preferences.indentSpaces)
        this.foreign_key_columns = []
        this.writeHead()
        this.writer.writeLine('"changeSet": {')
        this.writer.writeLine('"id": "1",')
        this.writer.writeLine('"author": "'+this.preferences.author+'",')
        this.writer.writeLine('"changes": [')
        this.writer.writeLine('{')
        this.writer.writeLine('"createTable": {')
        this.writer.writeLine('"tableName": "'+table.name+'",')
        this.writer.writeLine('"columns": [')
        let lg = this

        for(let i = 0; i < table.columns.length; i++){
            lg.writeColumns(table.columns[i], table.columns.length, i)
        }

        this.writer.writeLine("]")
        this.writer.writeLine("}")
        if(this.foreign_key_columns.length === 0){
            this.writer.writeLine("}")
        }else{
            this.writer.writeLine("},")
        }

        for (let i= 0; i < this.foreign_key_columns.length; i++){
            lg.writeForeignConstraints(table, this.foreign_key_columns[i], i)
        }

        this.writer.writeLine('],')
        this.writeRollback(table)
        this.writer.writeLine('}')
        this.writer.writeLine('}')
        this.writer.writeLine(']')
        this.writer.writeLine('}')
        this.writer.createFile(this.path_destination+"/"+this.file_id+"-"+table.name+".json")

        let file_id_string = this.file_id.toString()
        if((file_id_string.substring(file_id_string.length - 2))==="59"){
            this.file_id+=41
        }else{
            this.file_id++
        }
    }
    writeHead(){
        this.writer.writeLine('{')
        this.writer.writeLine('"databaseChangeLog": [')
        this.writer.writeLine('{')
    }
    writeColumns(column, tableColumnsLength, index){

        let type = column.type
        if(column.length){
            type = type+"("+column.length+")"
        }
        this.writer.writeLine('{')
        this.writer.writeLine('"column": {')
        this.writer.writeLine('"name": "'+column.name+'",')
        this.writer.writeLine('"type": "'+type+'",')
        this.writer.writeLine('"constraints": {')

        if(column.primaryKey){
            this.writer.writeLine('"primaryKey": true,')
        }
        if(column.unique){
            this.writer.writeLine('"unique": true,')
        }
        this.writer.writeLine('"nullable": '+column.nullable)
        this.writer.writeLine('}')
        this.writer.writeLine('}')
        if(index < tableColumnsLength-1){
            this.writer.writeLine('},')
        }else{
            this.writer.writeLine('}')
        }

        if(column.foreignKey){
            this.foreign_key_columns.push(column)
        }
    }

    writeForeignConstraints(table, column, index){
        this.writer.writeLine('{')
        this.writer.writeLine('"addForeignKeyConstraint": {')
        this.writer.writeLine('"baseColumnNames":  "'+column.name+'",')
        this.writer.writeLine('"baseTableName":  "'+table.name+'",')
        this.writer.writeLine('"constraintName":  "'+'fk_'+column.name+'",')
        this.writer.writeLine('"deferrable":  true,')
        this.writer.writeLine('"initiallyDeferred":  true,')
        this.writer.writeLine('"onDelete":  "CASCADE",')
        this.writer.writeLine('"onUpdate":  "RESTRICT",')
        this.writer.writeLine('"referencedColumnNames":  "'+column.referenceTo.name+'",')
        this.writer.writeLine('"referencedTableName":  "'+column.referenceTo._parent.name+'",')
        this.writer.writeLine('"validate":  true')
        this.writer.writeLine('}')
        if(index < this.foreign_key_columns.length-1){
            this.writer.writeLine('},')
        }else{
            this.writer.writeLine('}')
        }
    }

    writeRollback(table){
        this.writer.writeLine('"rollback": [')
        this.writer.writeLine('{')
        this.writer.writeLine('"dropTable": {')
        this.writer.writeLine('"cascadeConstraints": "'+this.preferences.cascadeConstraints+'",')
        this.writer.writeLine('"tableName": "'+table.name+'"')
        this.writer.writeLine('}')
        this.writer.writeLine('}')
        this.writer.writeLine(']')
    }
}
exports.export = SavneLiquibaseJsonExporter;