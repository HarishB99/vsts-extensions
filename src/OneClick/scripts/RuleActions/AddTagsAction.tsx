import * as React from "react";

import { Loading } from "Library/Components/Loading";
import { getAsyncLoadedComponent } from "Library/Components/Utilities/AsyncLoadedComponent";
import { union } from "Library/Utilities/Array";
import {
    isNullOrWhiteSpace, localeIgnoreCaseComparer, stringEquals
} from "Library/Utilities/String";
import * as WorkItemFormHelpers from "Library/Utilities/WorkItemFormHelpers";
import { IIconProps } from "OfficeFabric/Icon";
import { autobind } from "OfficeFabric/Utilities";
import * as ActionRenderers_Async from "OneClick/Components/ActionRenderers";
import { CoreFieldRefNames } from "OneClick/Constants";
import { BaseAction } from "OneClick/RuleActions/BaseAction";

const AsyncWorkItemTagPicker = getAsyncLoadedComponent(
    ["scripts/ActionRenderers"],
    (m: typeof ActionRenderers_Async) => m.WorkItemTagPicker,
    () => <Loading />);

export class AddTagsAction extends BaseAction {
    public async run() {
        const tags = await WorkItemFormHelpers.getWorkItemFieldValue(CoreFieldRefNames.Tags) as string;
        let newTags: string[];
        const addedTags = (this.getAttribute<string>("tags", true) as string).split(";").map(t => t.trim());
        if (tags) {
            const existingTags = tags.split(";").map(t => t.trim());
            newTags = union(existingTags, addedTags, localeIgnoreCaseComparer);
        }
        else {
            newTags = addedTags;
        }

        await WorkItemFormHelpers.setWorkItemFieldValue(CoreFieldRefNames.Tags, newTags.join(";"));
    }

    public getFriendlyName(): string {
        return "Add tags";
    }

    public getDescription(): string {
        return "Adds tags to the workitem";
    }

    public isDirty(): boolean {
        return super.isDirty() || !stringEquals(this.getAttribute<string>("tags", true), this.getAttribute<string>("tags"), true);
    }

    public isValid(): boolean {
        return !isNullOrWhiteSpace(this.getAttribute<string>("tags"));
    }

    public getIcon(): IIconProps {
        return {
            iconName: "Tag",
            styles: {
                root: {color: "#004578 !important"}
            }
        };
    }

    public render(): React.ReactNode {
        const value = this.getAttribute<string>("tags");
        const tags = isNullOrWhiteSpace(value) ? [] : value.split(";");

        return (
            <div>
                <AsyncWorkItemTagPicker
                    className="action-property-control"
                    selectedTags={tags}
                    label="Add tags"
                    info="Select tags to be added"
                    required={true}
                    onChange={this._onTagsChange}
                />
            </div>
        );
    }

    protected defaultAttributes(): IDictionaryStringTo<any> {
        return {
            tags: ""
        };
    }

    @autobind
    private _onTagsChange(tags: string[]) {
        this.setAttribute<string>("tags", tags.join(";"));
    }
}
