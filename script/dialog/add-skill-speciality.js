/**
 * Dialog for adding a skill speciality to an actor
 */
export class AddSkillSpecialityDialog extends Dialog {
    constructor(actor, skillKey, skillName, options = {}) {
        const dialogData = {
            title: game.i18n.localize("DIALOG.ADD_SKILL_SPECIALITY"),
            content: "",
            buttons: {
                add: {
                    icon: '<i class="fa-solid fa-plus"></i>',
                    label: game.i18n.localize("BUTTON.ADD"),
                    callback: html => this._onAdd(html)
                },
                cancel: {
                    icon: '<i class="fa-solid fa-times"></i>',
                    label: game.i18n.localize("BUTTON.CANCEL"),
                    callback: () => this.close()
                }
            },
            default: "add",
            close: () => null
        };

        super(dialogData, options);

        this.actor = actor;
        this.skillKey = skillKey;
        this.skillName = skillName;
    }

    /** @override */
    async getData() {
        const data = await super.getData();
        data.skillName = this.skillName;
        return data;
    }

    /** @override */
    async _renderInner(data) {
        const template = "systems/dark-heresy/template/dialog/add-skill-speciality.hbs";
        const html = await renderTemplate(template, data);
        return $(html);
    }

    /**
     * Handle adding the speciality
     * @param {jQuery} html The dialog HTML
     * @private
     */
    async _onAdd(html) {
        const form = html[0].querySelector("form");
        const formData = new FormData(form);
        const specialityName = formData.get("specialityName")?.trim();

        if (!specialityName) {
            ui.notifications.error(game.i18n.localize("ERROR.SPECIALITY_NAME_REQUIRED"));
            return;
        }

        // Check if speciality already exists
        const skill = this.actor.system.skills[this.skillKey];
        const existingSpeciality = Object.values(skill.specialities || {}).find(
            spec => spec.label.toLowerCase() === specialityName.toLowerCase()
        );

        if (existingSpeciality) {
            ui.notifications.error(game.i18n.localize("ERROR.SPECIALITY_ALREADY_EXISTS"));
            return;
        }

        // Generate unique key for the new speciality
        const specialityKey = this._generateSpecialityKey(specialityName);

        // Create new speciality data
        const newSpeciality = {
            label: specialityName,
            advance: -20,
            cost: 0,
            starter: false
        };

        // Update actor data
        const updatePath = `system.skills.${this.skillKey}.specialities.${specialityKey}`;
        await this.actor.update({
            [updatePath]: newSpeciality
        });

        ui.notifications.info(game.i18n.format("NOTIFICATION.SPECIALITY_ADDED", {
            speciality: specialityName,
            skill: this.skillName
        }));

        // Close the dialog after successful addition
        this.close();
    }

    /**
     * Generate a unique key for the speciality
     * @param {string} name The speciality name
     * @returns {string} The generated key
     * @private
     */
    _generateSpecialityKey(name) {
        const baseKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const skill = this.actor.system.skills[this.skillKey];
        const existingKeys = Object.keys(skill.specialities || {});

        let key = baseKey;
        let counter = 1;

        while (existingKeys.includes(key)) {
            key = `${baseKey}${counter}`;
            counter++;
        }

        return key;
    }

    /**
     * Show the dialog
     * @param {Actor} actor The actor to add speciality to
     * @param {string} skillKey The skill key
     * @param {string} skillName The skill name for display
     * @returns {Promise} Promise that resolves when dialog is closed
     */
    static async show(actor, skillKey, skillName) {
        return new Promise(resolve => {
            const dialog = new AddSkillSpecialityDialog(actor, skillKey, skillName, {
                width: 400,
                height: 150,
                resizable: false
            });
            dialog.render(true);
            resolve(dialog);
        });
    }
}
