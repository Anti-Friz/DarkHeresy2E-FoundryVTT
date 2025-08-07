/**
 * Dialog for tracking experience sources and managing XP allocation.
 * Allows players and GMs to record where experience points came from
 * and automatically calculates total experience from sources.
 */
export class ExperienceTrackerDialog {
  /**
   * Shows the Experience Tracker dialog for the given actor.
   * 
   * @param {DarkHeresyActor} actor - The actor to track experience for
   * @returns {Promise<void>} Promise that resolves when dialog is closed
   */
  static async show(actor) {
    // Initialize experience sources if not present
    if (!actor.system.experience.sources) {
      await actor.update({
        "system.experience.sources": []
      });
    }

    const context = this._prepareDialogContext(actor);
    const content = await renderTemplate("systems/dark-heresy/template/dialog/experience-tracker.hbs", context);
    
    return new Promise((resolve) => {
      const dialog = new Dialog({
        title: game.i18n.localize("EXPERIENCE.TRACKER"),
        content: content,
        buttons: {
          save: {
            icon: '<i class="fa-solid fa-save"></i>',
            label: game.i18n.localize("BUTTON.SAVE"),
            callback: async (html) => {
              await this._saveExperienceData(html, actor);
              resolve();
            }
          },
          cancel: {
            icon: '<i class="fa-solid fa-times"></i>',
            label: game.i18n.localize("BUTTON.CANCEL"),
            callback: () => resolve()
          }
        },
        default: "save",
        render: (html) => {
          // Add spent experience as data attribute for calculations
          const element = html[0];
          element.dataset.spentExperience = context.spentExperience || 0;
          this._activateListeners(html, actor);
        },
        close: () => resolve()
      }, {
        width: 600,
        //resizable: true,
        classes: ["dark-heresy"]
      });
      
      dialog.render(true);
    });
  }

  /**
   * Prepares the context data for the dialog template.
   * 
   * @param {DarkHeresyActor} actor - The actor to prepare context for
   * @returns {Object} Context object for template rendering
   */
  static _prepareDialogContext(actor) {
    const experienceSources = actor.system.experience.sources || [];
    const totalFromSources = experienceSources.reduce((total, source) => total + (source.amount || 0), 0);
    const spentExperience = actor.system.experience.totalSpent || 0;
    
    return {
      experienceSources: experienceSources,
      totalExperience: totalFromSources,
      remainingExperience: totalFromSources - spentExperience,
      totalFromSources: totalFromSources,
      spentExperience: spentExperience
    };
  }

  /**
   * Activates event listeners for the dialog.
   * 
   * @param {jQuery} html - The dialog HTML content (jQuery object)
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _activateListeners(html, actor) {
    // Convert jQuery object to native DOM element
    const element = html[0];

    // Add source button
    element.querySelector('.add-source-btn').addEventListener('click', (event) => {
      event.preventDefault();
      this._addExperienceSource(html, actor);
    });

    // Delete source buttons
    element.querySelectorAll('.delete-source-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this._deleteExperienceSource(event, html, actor);
      });
    });

    // Update total when amounts change
    element.querySelectorAll('.source-amount').forEach(input => {
      input.addEventListener('input', () => {
        this._updateTotalDisplay(html);
      });
    });
  }

  /**
   * Adds a new experience source row to the dialog.
   * 
   * @param {jQuery} html - The dialog HTML content (jQuery object)
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _addExperienceSource(html, actor) {
    const element = html[0]; // Convert jQuery to native DOM
    const sourcesList = element.querySelector('.sources-list');
    const noSourcesMsg = sourcesList.querySelector('.no-sources');
    
    // Remove "no sources" message if present
    if (noSourcesMsg) {
      noSourcesMsg.remove();
    }

    // Get current number of sources to determine index
    const currentSources = sourcesList.querySelectorAll('.source-row');
    const newIndex = currentSources.length;

    // Create new source row
    const newRow = document.createElement('div');
    newRow.className = 'source-row';
    newRow.dataset.index = newIndex;
    newRow.innerHTML = `
      <input type="text" class="source-description" value="" placeholder="${game.i18n.localize('EXPERIENCE.SOURCE')}" />
      <input type="number" class="source-amount" value="0" min="0" placeholder="${game.i18n.localize('EXPERIENCE.AMOUNT')}" />
      <button type="button" class="delete-source-btn" title="${game.i18n.localize('EXPERIENCE.DELETE_SOURCE')}">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    // Add event listeners to new row
    newRow.querySelector('.delete-source-btn').addEventListener('click', (event) => {
      event.preventDefault();
      this._deleteExperienceSource(event, html, actor);
    });

    newRow.querySelector('.source-amount').addEventListener('input', () => {
      this._updateTotalDisplay(html);
    });

    // Append to sources list
    sourcesList.appendChild(newRow);

    // Focus on the description field
    newRow.querySelector('.source-description').focus();
  }

  /**
   * Deletes an experience source row from the dialog.
   * 
   * @param {Event} event - The click event
   * @param {jQuery} html - The dialog HTML content (jQuery object)
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _deleteExperienceSource(event, html, actor) {
    const sourceRow = event.currentTarget.closest('.source-row');
    sourceRow.remove();

    // Update total display
    this._updateTotalDisplay(html);

    // Check if we need to show "no sources" message
    const element = html[0]; // Convert jQuery to native DOM
    const sourcesList = element.querySelector('.sources-list');
    const remainingSources = sourcesList.querySelectorAll('.source-row');
    
    if (remainingSources.length === 0) {
      const noSourcesDiv = document.createElement('div');
      noSourcesDiv.className = 'no-sources';
      noSourcesDiv.innerHTML = `<p>${game.i18n.localize("EXPERIENCE.NO_SOURCES")}</p>`;
      sourcesList.appendChild(noSourcesDiv);
    }
  }

  /**
   * Updates the total experience display based on current source amounts.
   * 
   * @param {jQuery} html - The dialog HTML content (jQuery object)
   */
  static _updateTotalDisplay(html) {
    let totalFromSources = 0;
    const element = html[0]; // Convert jQuery to native DOM
    
    element.querySelectorAll('.source-amount').forEach(input => {
      const amount = parseInt(input.value) || 0;
      totalFromSources += amount;
    });

    // Update the total from sources display
    const totalFromSourcesElement = element.querySelector('.total-from-sources');
    if (totalFromSourcesElement) {
      totalFromSourcesElement.textContent = totalFromSources;
    }
    
    // Update total experience (total from sources becomes new total)
    const totalExperienceElement = element.querySelector('.total-experience');
    if (totalExperienceElement) {
      totalExperienceElement.textContent = totalFromSources;
    }
    
    // Calculate and update remaining experience
    const spent = parseInt(element.dataset.spentExperience) || 0;
    const remaining = totalFromSources - spent;
    const remainingElement = element.querySelector('.remaining-experience');
    if (remainingElement) {
      remainingElement.textContent = remaining;
    }
  }

  /**
   * Saves the experience data from the dialog to the actor.
   * 
   * @param {jQuery} html - The dialog HTML content (jQuery object)
   * @param {DarkHeresyActor} actor - The actor to update
   * @returns {Promise<void>} Promise that resolves when save is complete
   */
  static async _saveExperienceData(html, actor) {
    const sources = [];
    const element = html[0]; // Convert jQuery to native DOM
    
    // Collect all source data
    element.querySelectorAll('.source-row').forEach(row => {
      const description = row.querySelector('.source-description').value.trim();
      const amount = parseInt(row.querySelector('.source-amount').value) || 0;
      
      // Only save sources with description and positive amount
      if (description && amount > 0) {
        sources.push({
          description: description,
          amount: amount
        });
      }
    });

    // Calculate new total experience from sources
    const totalFromSources = sources.reduce((total, source) => total + source.amount, 0);
    const spentExperience = actor.system.experience.totalSpent || 0;
    const remainingExperience = totalFromSources - spentExperience;
    
    // Update actor data
    const updateData = {
      "system.experience.sources": sources,
      "system.experience.value": totalFromSources,
      "system.experience.remaining": remainingExperience
    };

    await actor.update(updateData);

    // Show success notification
    ui.notifications.info(game.i18n.localize("NOTIFICATION.EXPERIENCE_TRACKER_SAVED"));
  }
}
