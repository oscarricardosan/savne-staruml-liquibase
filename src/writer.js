const fs = require('fs')

class Writer{
    constructor (indentSpaces) {

        this.lines = []
        this.indent_string = ' '.repeat(indentSpaces)
        this.indent_level = 0
        this.indent_character = ""
        this.splice_position = -1
    }

    writeLine(line){
        if(line){
            if(line.includes("</")){
                this.indent_level-=1
            }
            if(line.includes("]")){
                this.indent_level-=1
            }

            if(line.includes("}")){
                this.indent_level-=1
            }
            let text = ''
            for (let i= 0; i < this.indent_level;i++){
                text+=this.indent_string
            }
            text+=line

            if(this.splice_position>-1){
                this.writeInSplicePosition(text)
            }else{
                this.lines.push(text)
            }

            if(line.includes("<") && !line.includes("</")){
                this.indent_level+=1
            }
            if(line.includes("/>")){
                this.indent_level-=1
            }
            if(line.includes("[")){
                this.indent_level+=1
            }
            if(line.includes("{")){
                this.indent_level+=1
            }
            if((line.split("'").length-1)%2!==0){
                if(this.indent_character==="'"){
                    this.indent_level-=1
                    this.indent_character=""
                }else{
                    this.indent_level+=1
                    this.indent_character="'"
                }
            }
            if((line.split('"').length-1)%2!==0){
                if(this.indent_character==='"'){
                    this.indent_level-=1
                    this.indent_character=""
                }else{
                    this.indent_level+=1
                    this.indent_character='"'
                }
            }
        }else{
            this.lines.push("")
        }
    }

    writeInSplicePosition(text){
        this.lines.splice(this.splice_position, 0, text)
        this.splice_position++
    }

    getData(){
        return this.lines.join("\n")
    }

    createFile(path){
        fs.writeFileSync(path, this.getData());
    }

    setPosition(index){
        if(index==="last"){
            this.splice_position=-1
        }else if(index>=0){
            this.splice_position=index
        }
    }
}
exports.Writer = Writer;