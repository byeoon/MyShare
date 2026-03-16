const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: "Note",
    tableName: "notes",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
        },
        title: {
            type: "varchar"
        },
        content: {
            type: "text"
        },
        file: {
            type: "varchar"
        },
        tags: {
            type: "simple-array",
            nullable: true
        },
        visibility: {
            type: "boolean"
        }
    },
    relations : {
        author: {
            type: "many-to-one",
            target : "User",
            joinColumn: {
                name: "userId",
                referencedColumnName: "id"
            },
            onDelete: "CASCADE"
        },
    },
})