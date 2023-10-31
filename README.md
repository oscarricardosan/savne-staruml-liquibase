# Savne-StarUML-Liquibase

**Savne-StarUML-Liquibase** is a package created by employees of
[Savne SAS](https://savne.net) and free to use by anyone.

This package contains tools that allows programmers that use Liquibase to get the most out of the StarUml tool.

---

## Generate liquibase migration

This tools generates liquibase migrations based on an existing Start Uml entity relation diagram.

### USE

1. Click on the menu Tools/Savne Liquibase/Generate liquibase migration.
2. Select the data model you want to export.
3. Select the folder where you want to export the migrations.
4. Select the migrations format (Xml, Json, Sql)


### CONFIGURATION OPTIONS

* **Author:** Changes the migration's author
  ```xml
  <changeSet id="migrationId" author="Author's email">
  </changeSet>
  ```

* **Indent Spaces:** Sets the number of indentation spaces
* **Cascade sonstraints:** Enables the recursive rollback
   
* **Use specification as method code:** Use the content of the specification field, in an operation as code within the method.
   ```xml
    <rollback>
        <dropTable cascadeConstraints="false" tableName="users"/>
    </rollback>
    ```