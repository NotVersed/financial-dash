import {getClientsForDropdown} from '@/api/client'

export default async function DropDown() {
    const clients = await getClientsForDropdown()

    console.log("CLIENTS:", clients)
    return (
        <select>
        {clients?.map((client: any) => (
            <option key={client.id} value={client.id}>
            {client.client_name}
            </option>

        ))}
        </select>
    )
}