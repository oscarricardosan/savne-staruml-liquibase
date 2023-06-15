const writeFile = require("./writer");

class SavneLiquibaseSqlExporter {

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

        this.writer.writeLine()
        this.writer.writeLine('--changeset '+this.preferences.author+':'+this.file_id+'')
        this.writer.writeLine()
        this.writer.writeLine('create table '+table.name+' (  ')
        let lg = this

        for(let i = 0; i < table.columns.length; i++){
            lg.writeColumns(table.columns[i], table.columns.length, i)
        }
        this.writer.writeLine(');')

        this.foreign_key_columns.forEach(function(column){
            lg.writeForeignConstraints(table, column)
        })

        this.writeRollback(table)
        this.writer.createFile(this.path_destination+"/"+this.file_id+"-"+table.name+".sql")

        let file_id_string = this.file_id.toString()
        if((file_id_string.substring(file_id_string.length - 2))==="59"){
            this.file_id+=41
        }else{
            this.file_id++
        }
    }
    writeHead(){
        this.writer.writeLine('--liquibase formatted sql')
    }
    writeColumns(column, tableColumnsLength, index){

        let type = column.type
        let variableLengthDataTypes = [
            'CHAR',
            'VARCHAR',
            'TEXT',
            'BYTEA',
            'JSON',
            'JSONB',
            'XML',
            'ARRAY',
            'TSVECTOR',
            'TSQUERY',
            'UUID',
            'CIDR',
            'INET',
            'MACADDR',
            'BIT',
            'VARBIT',
            'INTERVAL',
            'TIME',
            'TIMETZ',
            'TIMESTAMP',
            'TIMESTAMPTZ',
            'DATE',
            'NUMERIC',
            'MONEY',
            'BYTE',
            'HSTORE',
            'ENUM',
            'REGCLASS',
            'REGCONFIG',
            'REGDICTIONARY',
            'REGNAMESPACE',
            'REGOPER',
            'REGOPERATOR',
            'REGPROC',
            'REGPROCEDURE',
            'REGROLE',
            'REGTYPE',
            'CSTRING',
            'ANY',
            'ANYARRAY',
            'ANYELEMENT',
            'ANYNONARRAY',
            'ANYENUM',
            'ANYRANGE'
        ]
        if(column.length && variableLengthDataTypes.includes(type.toUpperCase())){
            type = type+"("+column.length+")"
        }
        let query = column.name+' '+type

        if(column.nullable){
            query += ' null'
        }

        if(column.primaryKey){
            query += ' primary key'
        }

        if(column.unique){
            query += ' unique'
        }

        if(index < tableColumnsLength-1){
            query += ','
        }

        this.writer.writeLine(query)

        if(column.foreignKey){
            this.foreign_key_columns.push(column)
        }
    }

    writeForeignConstraints(table, column){
        this.writer.writeLine()
        this.writer.writeLine('ALTER TABLE '+table.name)
        this.writer.writeLine('ADD CONSTRAINT '+'fk_'+column.name)
        this.writer.writeLine('FOREIGN KEY ('+column.name+')')
        this.writer.writeLine('REFERENCES '+column.referenceTo._parent.name+' ('+column.referenceTo.name+')')
        this.writer.writeLine('ON UPDATE RESTRICT')
        this.writer.writeLine('ON DELETE CASCADE')
        this.writer.writeLine('DEFERRABLE')
        this.writer.writeLine('INITIALLY DEFERRED;')
    }

    writeRollback(table){
        this.writer.writeLine()
        this.writer.writeLine('-- rollback drop table '+table.name+';')
        this.writer.writeLine()
    }
}
exports.export = SavneLiquibaseSqlExporter;