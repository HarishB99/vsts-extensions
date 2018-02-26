import { WorkItemFieldActionsHub } from "Library/Flux/Actions/ActionsHub";
import { StoreFactory } from "Library/Flux/Stores/BaseStore";
import { WorkItemFieldStore } from "Library/Flux/Stores/WorkItemFieldStore";
import { localeIgnoreCaseComparer } from "Library/Utilities/String";
import { WorkItemField } from "TFS/WorkItemTracking/Contracts";
import * as WitClient from "TFS/WorkItemTracking/RestClient";

export namespace WorkItemFieldActions {
    const workItemFieldStore: WorkItemFieldStore = StoreFactory.getInstance<WorkItemFieldStore>(WorkItemFieldStore);

    export async function initializeWorkItemFields() {
        if (workItemFieldStore.isLoaded()) {
            WorkItemFieldActionsHub.InitializeWorkItemFields.invoke(null);
        }
        else if (!workItemFieldStore.isLoading()) {
            workItemFieldStore.setLoading(true);
            try {
                const workItemFields = await WitClient.getClient().getFields(VSS.getWebContext().project.id);
                workItemFields.sort((a: WorkItemField, b: WorkItemField) => localeIgnoreCaseComparer(a.name, b.name));
                WorkItemFieldActionsHub.InitializeWorkItemFields.invoke(workItemFields);
                workItemFieldStore.setLoading(false);
            }
            catch (e) {
                workItemFieldStore.setLoading(false);
                throw e.message;
            }
        }
    }
}
