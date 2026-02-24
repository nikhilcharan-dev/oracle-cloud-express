let namespaceName = null;

import client from "./oci.client.js";

export async function getNamespace() {
    if (!namespaceName) {
        const response = await client.getNamespace({});
        namespaceName = response.value;
        console.log("[Namespace] initialized:", namespaceName);
    }

    return namespaceName;
}