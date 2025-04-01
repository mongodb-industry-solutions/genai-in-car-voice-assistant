import { column, Schema, Table } from '@powersync/web';

const vehicleData = new Table(
    {
        // id column (text) is automatically included
        Acceleration: column.text,
        CurrentLocation: column.text,
        Diagnostics: column.text,
        Speed: column.integer,
        TraveledDistance: column.integer,
        VehicleIdentification: column.text
    },
    { indexes: {} }
);

const AppSchema = new Schema({
    vehicleData
});

export default AppSchema;
