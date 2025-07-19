/**
 * Dialog for adding a skill speciality to an actor
 */
export class AddSkillSpecialityDialog {
    /**
     * Show the dialog
     * @param {Actor} actor The actor to add speciality to
     * @param {string} skillKey The skill key
     * @param {string} skillName The skill name for display
     * @returns {Promise} Promise that resolves when dialog is closed
     */
    static async show(actor, skillKey, skillName) {
        const templateData = { skillName };
        const html = await renderTemplate("systems/dark-heresy/template/dialog/add-skill-speciality.hbs", templateData);

        return new Promise(resolve => {
            const dialog = new Dialog({
                title: game.i18n.localize("DIALOG.ADD_SKILL_SPECIALITY"),
                content: html,
                buttons: {
                    add: {
                        icon: '<i class="fa-solid fa-plus"></i>',
                        label: game.i18n.localize("BUTTON.ADD"),
                        callback: async html => {
                            await AddSkillSpecialityDialog._onAdd(html, actor, skillKey, skillName);
                            resolve(true);
                        }
                    },
                    cancel: {
                        icon: '<i class="fa-solid fa-times"></i>',
                        label: game.i18n.localize("BUTTON.CANCEL"),
                        callback: () => resolve(false)
                    }
                },
                default: "add",
                render: html => {
                    // Focus on speciality input
                    html.find("#speciality-name").focus().select();

                    // Handle Enter key on form
                    html.find("form").on("submit", event => {
                        event.preventDefault();
                        html.parent().find('[data-button="add"]').click();
                    });
                }
            }, {
                width: 400,
                height: 200,
                resizable: false
            });

            dialog.render(true);
        });
    }

    /**
     * Handle adding the speciality
     * @param {jQuery} html The dialog HTML
     * @param {Actor} actor The actor
     * @param {string} skillKey The skill key
     * @param {string} skillName The skill name
     * @private
     */
    static async _onAdd(html, actor, skillKey, skillName) {
        // Get speciality name from the input field
        const specialityName = html.find("#speciality-name").val()?.trim();

        if (!specialityName) {
            ui.notifications.error(game.i18n.localize("ERROR.SPECIALITY_NAME_REQUIRED"));
            return;
        }

        // Check if speciality already exists
        const skill = actor.system.skills[skillKey];
        const existingSpeciality = Object.values(skill.specialities || {}).find(
            spec => spec.label.toLowerCase() === specialityName.toLowerCase()
        );

        if (existingSpeciality) {
            ui.notifications.error(game.i18n.localize("ERROR.SPECIALITY_ALREADY_EXISTS"));
            return;
        }

        // Generate unique key for the new speciality
        const specialityKey = AddSkillSpecialityDialog._generateSpecialityKey(specialityName, skill);

        // Create new speciality data
        const newSpeciality = {
            label: specialityName,
            advance: -20,
            cost: 0,
            starter: false
        };

        // Update actor data
        const updatePath = `system.skills.${skillKey}.specialities.${specialityKey}`;
        await actor.update({
            [updatePath]: newSpeciality
        });

        ui.notifications.info(game.i18n.format("NOTIFICATION.SPECIALITY_ADDED", {
            speciality: specialityName,
            skill: skillName
        }));
    }

    /**
     * Generate a unique key for the speciality
     * @param {string} name The speciality name
     * @param {object} skill The skill object
     * @returns {string} The generated key
     * @private
     */
    static _generateSpecialityKey(name, skill) {
        const baseKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const existingKeys = Object.keys(skill.specialities || {});

        let key = baseKey;
        let counter = 1;

        while (existingKeys.includes(key)) {
            key = `${baseKey}${counter}`;
            counter++;
        }

        return key;
    }
}
