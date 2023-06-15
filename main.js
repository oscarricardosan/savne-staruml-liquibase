const SavneLiquibaseGenerator = require("./src/SavneLiquibaseGenerator");
let savneLiquibaseGenerator= new SavneLiquibaseGenerator.new();

function init () {
    savneLiquibaseGenerator.init()
}

exports.init = init