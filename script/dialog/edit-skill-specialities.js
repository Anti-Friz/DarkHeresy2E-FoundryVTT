/**
 * Dialog for editing skill specialities with drag & drop functionality
 */
/**
 * Dialog for editing skill specialities with drag & drop functionality
 */
export class EditSkillSpecialitiesDialog {
    /**
     * Show the dialog for editing skill specialities.
     * @param {Actor} actor The actor to edit specialities for.
     * @param {string} skillKey The skill key.
     * @param {string} skillName The skill name for display.
     * @returns {Promise<boolean>} Promise that resolves to true if saved, false if cancelled.
     */
    static async show(actor, skillKey, skillName) {
        const skill = actor.system.skills[skillKey];
        const specialities = Object.entries(skill.specialities || {}).map(([key, speciality]) => ({
            key,
            label: speciality.label,
            advance: speciality.advance,
            cost: speciality.cost,
            starter: speciality.starter
        }));

        const templateData = {
            skillName,
            specialities
        };

        const html = await renderTemplate("systems/dark-heresy/template/dialog/edit-skill-specialities.hbs", templateData);

        return new Promise(resolve => {
            const dialog = new Dialog({
                title: game.i18n.localize("DIALOG.EDIT_SKILL_SPECIALITIES"),
                content: html,
                buttons: {
                    add: {
                        icon: '<i class="fa-solid fa-plus"></i>',
                        label: game.i18n.localize("BUTTON.SAVE"),
                        callback: async html => {
                            await EditSkillSpecialitiesDialog._saveChanges(html, actor, skillKey);
                            resolve(true);
                        }
                    },
                    cancel: {
                        icon: '<i class="fa-solid fa-times"></i>',
                        label: game.i18n.localize("BUTTON.CANCEL"),
                        callback: () => resolve(false)
                    }
                }, // No default buttons, we handle them manually
                default: null,
                render: html => {
                    EditSkillSpecialitiesDialog._activateListeners(html, actor, skillKey, skillName, resolve);
                }
            }, {
                width: 600,
                height: 500,
                resizable: true
            });

            dialog.render(true);
        });
    }


    /**
     * Activate event listeners for the dialog.
     * @param {jQuery} html The dialog HTML.
     * @param {Actor} actor The actor.
     * @param {string} skillKey The skill key.
     * @param {string} skillName The skill name.
     * @param {Function} resolve The promise resolve function.
     * @private
     */
    static _activateListeners(html, actor, skillKey, skillName, resolve) {

        // HTML5 Drag and Drop
        let dragSrcEl = null;
        let dragIndex = null;
        const list = html.find(".specialities-list")[0];
        /**
         * Get the index of a row within the list.
         * @param {HTMLElement} row The row element.
         * @returns {number} The index of the row.
         */
        function getRowIndex(row) {
            return Array.from(list.children).indexOf(row);
        }
        /**
         * Handle the dragstart event for a row.
         * @param {DragEvent} e The drag event.
         */
        function handleDragStart(e) {
            dragSrcEl = this;
            dragIndex = getRowIndex(this);
            this.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", "");
        }
        /**
         * Handle the dragover event for a row.
         * @param {DragEvent} e The drag event.
         */
        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            const overRow = this;
            if (overRow === dragSrcEl) return;
            overRow.classList.add("drag-over");
        }
        /**
         * Handle the dragleave event for a row.
         * @param {DragEvent} e The drag event.
         */
        function handleDragLeave(e) {
            this.classList.remove("drag-over");
        }
        /**
         * Handle the drop event for a row.
         * @param {DragEvent} e The drag event.
         * @returns {boolean} False to prevent default.
         */
        function handleDrop(e) {
            e.stopPropagation();
            this.classList.remove("drag-over");
            if (dragSrcEl !== this) {
                const from = dragIndex;
                const to = getRowIndex(this);
                if (from !== to) {
                    if (to > from) {
                        this.after(dragSrcEl);
                    } else {
                        this.before(dragSrcEl);
                    }
                }
            }
            return false;
        }
        /**
         * Handle the dragend event for a row.
         * @param {DragEvent} e The drag event.
         */
        function handleDragEnd(e) {
            this.classList.remove("dragging");
            Array.from(list.children).forEach(row => row.classList.remove("drag-over"));
        }
        // Attach drag events
        Array.from(list.children).forEach(row => {
            row.setAttribute("draggable", "true");
            row.addEventListener("dragstart", handleDragStart);
            row.addEventListener("dragover", handleDragOver);
            row.addEventListener("dragleave", handleDragLeave);
            row.addEventListener("drop", handleDrop);
            row.addEventListener("dragend", handleDragEnd);
        });

        // Delete speciality
        html.on("click", ".delete-speciality-btn", event => {
            $(event.currentTarget).closest(".speciality-row").remove();
        });
        // Handle Enter key in input fields
        html.on("keydown", ".speciality-name", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                EditSkillSpecialitiesDialog._addSpecialityRow(html);
            }
        });
    }

    /**
     * Save all changes to the actor's skill specialities.
     * @param {jQuery} html The dialog HTML.
     * @param {Actor} actor The actor.
     * @param {string} skillKey The skill key.
     * @private
     */
    static async _saveChanges(html, actor, skillKey) {
        const skill = actor.system.skills[skillKey];
        const currentSpecialities = skill.specialities || {};
        // Use native DOM API to get all .speciality-row elements in order
        const container = html[0] || html.get ? html[0] : html;
        const rows = container.querySelectorAll(".speciality-row");

        // Validate all speciality names
        const names = [];
        let hasErrors = false;

        // Build new specialities array (ordered)
        const newSpecialitiesArr = [];
        rows.forEach(row => {
            const nameInput = row.querySelector(".speciality-name");
            const name = nameInput.value.trim();
            if (!name) {
                nameInput.style.borderColor = "#dc3545";
                hasErrors = true;
                return;
            }
            if (names.includes(name.toLowerCase())) {
                nameInput.style.borderColor = "#dc3545";
                ui.notifications.error(game.i18n.format("ERROR.DUPLICATE_SPECIALITY_NAME", { name }));
                hasErrors = true;
                return;
            }
            names.push(name.toLowerCase());
            nameInput.style.borderColor = "";

            const originalKey = row.getAttribute("data-speciality-key");
            const isOriginal = row.getAttribute("data-original") === "true";

            let specialityData;
            let key;
            if (isOriginal && currentSpecialities[originalKey]) {
                // If label changed, update it
                if (currentSpecialities[originalKey].label !== name) {
                    specialityData = {
                        ...currentSpecialities[originalKey],
                        label: name
                    };
                } else {
                    specialityData = { ...currentSpecialities[originalKey] };
                }
                key = originalKey;
            } else {
                // New speciality
                specialityData = {
                    label: name,
                    advance: -20,
                    cost: 0,
                    starter: false
                };
                // Generate a unique key in lowerCamelCase, avoiding collisions with current and new
                const existingKeysObj = {
                    ...currentSpecialities,
                    ...Object.fromEntries(newSpecialitiesArr.map(s => [s.key, true]))
                };
                key = EditSkillSpecialitiesDialog._generateSpecialityKey(name, existingKeysObj);
            }
            newSpecialitiesArr.push({ key, data: specialityData });
        });

        if (hasErrors) {
            return;
        }

        // Compare with current: check for changes in keys, order, or labels
        const currentKeys = Object.keys(currentSpecialities);
        const newKeys = newSpecialitiesArr.map(s => s.key);
        let changed = false;
        // Check for removed or added
        if (
            currentKeys.length !== newKeys.length
            || !currentKeys.every(k => newKeys.includes(k))
            || !newKeys.every(k => currentKeys.includes(k))
        ) {
            changed = true;
        }
        // Check for order change
        if (!changed && currentKeys.length === newKeys.length) {
            for (let i = 0; i < newKeys.length; i++) {
                if (currentKeys[i] !== newKeys[i]) {
                    changed = true;
                    break;
                }
            }
        }
        // Check for label changes
        if (!changed) {
            for (let i = 0; i < newSpecialitiesArr.length; i++) {
                const { key, data } = newSpecialitiesArr[i];
                if (!currentSpecialities[key] || currentSpecialities[key].label !== data.label) {
                    changed = true;
                    break;
                }
            }
        }

        if (!changed) {
            // No changes, do not update
            return;
        }

        // Build new specialities object in the correct order
        const newSpecialities = {};
        for (const { key, data } of newSpecialitiesArr) {
            newSpecialities[key] = data;
        }
        // Update the actor with new specialities
        const updatePath = `system.skills.${skillKey}.specialities`;
        await actor.update({
            [updatePath]: null
        });
        await actor.update({
            [updatePath]: newSpecialities
        });

        ui.notifications.info(game.i18n.localize("NOTIFICATION.SPECIALITIES_UPDATED"));
    }

    /**
     * Generate a unique key for the speciality.
     * @param {string} name The speciality name.
     * @param {object} existingSpecialities Existing specialities object.
     * @returns {string} The generated key.
     * @private
     */
    /**
     * Generate a unique key for the speciality in lowerCamelCase.
     * @param {string} name The speciality name.
     * @param {object} existingSpecialities Existing specialities object.
     * @returns {string} The generated key in lowerCamelCase.
     * @private
     */
    static _generateSpecialityKey(name, existingSpecialities) {
        debugger;
        // Convert to lowerCamelCase: remove non-alphanum, capitalize words except first, join
        const words = name.match(/[A-Za-z0-9]+/g) || [];
        if (words.length === 0) return "speciality";
        const baseKey = words
            .map((w, i) => i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))
            .join("");
        const existingKeys = Object.keys(existingSpecialities);

        let key = baseKey;
        let counter = 1;

        while (existingKeys.includes(key)) {
            key = `${baseKey}${counter}`;
            counter++;
        }

        return key;
    }
}
