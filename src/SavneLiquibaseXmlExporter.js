const writeFile = require("./writer");

class SavneLiquibaseXmlExporter {

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
        this.writer.writeLine('<changeSet id="'+this.file_id+'" author="'+this.preferences.author+'">')
        this.writer.writeLine()
        this.writer.writeLine("<createTable tableName='"+table.name+"'>")

        let lg = this

        table.columns.forEach(function(column){
            lg.writeColumns(column)
        })
        this.writer.writeLine("</createTable>")

        this.foreign_key_columns.forEach(function(column){
            lg.writeForeignConstraints(table, column)
        })

        this.writeRollback(table)
        this.writer.writeLine('</changeSet>')
        this.writer.writeLine('</databaseChangeLog>')
        this.writer.createFile(this.path_destination+"/"+this.file_id+"-"+table.name+".xml")

        let file_id_string = this.file_id.toString()
        if((file_id_string.substring(file_id_string.length - 2))==="59"){
            this.file_id+=41
        }else{
            this.file_id++
        }
    }
    writeHead(){
        this.writer.writeLine('<?xml version="1.0" encoding="UTF-8"?>')
        this.writer.writeLine('<databaseChangeLog')
        this.writer.writeLine('xmlns="http://www.liquibase.org/xml/ns/dbchangelog"')
        this.writer.writeLine('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
        this.writer.writeLine('xmlns:ext="http://www.liquibase.org/xml/ns/dbchangelog-ext"')
        this.writer.writeLine('xmlns:pro="http://www.liquibase.org/xml/ns/pro"')
        this.writer.writeLine('xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog')
        this.writer.writeLine('http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd')
        this.writer.writeLine('http://www.liquibase.org/xml/ns/dbchangelog-ext http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-ext.xsd">')
    }
    writeColumns(column){

        let type = column.type
        if(column.length){
            type = type+"("+column.length+")"
        }
        this.writer.writeLine('<column name="'+column.name+'" type="'+type+'">')

        let constraints = '<constraints nullable="'+column.nullable+'"'
        if(column.primaryKey){
            constraints+=' primaryKey="true"'
        }
        if(column.unique){
            constraints+=' unique="true"'
        }
        constraints+='/>'
        this.writer.writeLine(constraints)

        this.writer.writeLine("</column>")
        if(column.foreignKey){
            this.foreign_key_columns.push(column)
        }
    }

    writeForeignConstraints(table, column){
        this.writer.writeLine()
        this.writer.writeLine('<addForeignKeyConstraint  baseColumnNames="'+column.name+'"')
        this.writer.writeLine('baseTableName="'+table.name+'"')
        this.writer.writeLine('constraintName="'+'fk_'+column.name+'"')
        this.writer.writeLine('deferrable="true"')
        this.writer.writeLine('initiallyDeferred="true"')
        this.writer.writeLine('onDelete="CASCADE"')
        this.writer.writeLine('onUpdate="RESTRICT"')
        this.writer.writeLine('referencedColumnNames="'+column.referenceTo.name+'"')
        this.writer.writeLine('referencedTableName="'+column.referenceTo._parent.name+'"')
        this.writer.writeLine('validate="true"/>')
    }

    writeRollback(table){
        this.writer.writeLine()
        this.writer.writeLine('<rollback>')
        this.writer.writeLine('<dropTable cascadeConstraints="'+this.preferences.cascadeConstraints+'" tableName="'+table.name+'"/>')
        this.writer.writeLine('</rollback>')
        this.writer.writeLine()
    }
}
exports.export = SavneLiquibaseXmlExporter;