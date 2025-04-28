export class DarkHeresyItemSheet extends ItemSheet {
    activateListeners(html) {
        super.activateListeners(html);
        html.find("input").focusin(ev => this._onFocusIn(ev));
    }

    async getData() {
        const data = await super.getData();
        data.enrichment = await this._handleEnrichment();
        data.system = data.data.system;
        return data;
    }

    async _handleEnrichment()
    {
        let enrichment ={};
        enrichment["system.description"] = await TextEditor.enrichHTML(this.item.system.description, {async: true});
        enrichment["system.effect"] = await TextEditor.enrichHTML(this.item.system.effect, { async: true });
        enrichment["system.benefit"] = await TextEditor.enrichHTML(this.item.system.benefit, { async: true });
        enrichment["system.shortDescription"] = await TextEditor.enrichHTML(this.item.system.shortDescription, { async: true });
        enrichment["system.special"] = await TextEditor.enrichHTML(this.item.system.special, { async: true });

        this.item.system.enrichedDescription = enrichment["system.description"];
        this.item.system.enrichedEffect = enrichment["system.effect"];
        this.item.system.enrichedBenefit = enrichment["system.benefit"];
        this.item.system.enrichedShortDescription = enrichment["system.shortDescription"];
        this.item.system.enrichedSpecial = enrichment["system.special"];

        return foundry.utils.expandObject(enrichment);
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        buttons = [
            {
                label: game.i18n.localize("BUTTON.POST_ITEM"),
                class: "item-post",
                icon: "fas fa-comment",
                onclick: ev => this.item.sendToChat()
            }
        ].concat(buttons);
        return buttons;
    }

    _onFocusIn(event) {
        $(event.currentTarget).select();
    }
}
