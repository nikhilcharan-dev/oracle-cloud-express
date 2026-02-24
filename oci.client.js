import common from "oci-common";
import objectStorage from "oci-objectstorage";

const provider = new common.ConfigFileAuthenticationDetailsProvider(
    "E:/Repositories/oracle-cloud-express/.oci/config",
    "DEFAULT"
);

const client = new objectStorage.ObjectStorageClient({
    authenticationDetailsProvider: provider
});

export default client;