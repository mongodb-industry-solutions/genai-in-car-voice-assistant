import { column, Schema, Table } from '@powersync/web';

const lists = new Table({
    created_at: column.text
})

const AppSchema = new Schema({
    lists
});

export default AppSchema;
