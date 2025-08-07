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
        render: (html) => this._activateListeners(html, actor),
        close: () => resolve()
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
    
    return {
      experienceSources: experienceSources,
      totalExperience: actor.system.experience.value || 0,
      remainingExperience: actor.system.experience.remaining || 0,
      totalFromSources: totalFromSources
    };
  }

  /**
   * Activates event listeners for the dialog.
   * 
   * @param {HTMLElement} html - The dialog HTML content
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _activateListeners(html, actor) {
    // Add source button
    html.querySelector('.add-source-btn').addEventListener('click', (event) => {
      event.preventDefault();
      this._addExperienceSource(html, actor);
    });

    // Delete source buttons
    html.querySelectorAll('.delete-source-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this._deleteExperienceSource(event, html, actor);
      });
    });

    // Update total when amounts change
    html.querySelectorAll('.source-amount').forEach(input => {
      input.addEventListener('input', () => {
        this._updateTotalDisplay(html);
      });
    });
  }

  /**
   * Adds a new experience source row to the dialog.
   * 
   * @param {HTMLElement} html - The dialog HTML content
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _addExperienceSource(html, actor) {
    const sourcesList = html.querySelector('.sources-list');
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
   * @param {HTMLElement} html - The dialog HTML content
   * @param {DarkHeresyActor} actor - The actor being edited
   */
  static _deleteExperienceSource(event, html, actor) {
    const sourceRow = event.currentTarget.closest('.source-row');
    sourceRow.remove();

    // Update total display
    this._updateTotalDisplay(html);

    // Check if we need to show "no sources" message
    const sourcesList = html.querySelector('.sources-list');
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
   * @param {HTMLElement} html - The dialog HTML content
   */
  static _updateTotalDisplay(html) {
    let total = 0;
    
    html.querySelectorAll('.source-amount').forEach(element => {
      const amount = parseInt(element.value) || 0;
      total += amount;
    });

    // Update the total display (for future enhancement)
    const totalFromSourcesElement = html.querySelector('.total-from-sources');
    if (totalFromSourcesElement) {
      totalFromSourcesElement.textContent = total;
    }
  }

  /**
   * Saves the experience data from the dialog to the actor.
   * 
   * @param {HTMLElement} html - The dialog HTML content
   * @param {DarkHeresyActor} actor - The actor to update
   * @returns {Promise<void>} Promise that resolves when save is complete
   */
  static async _saveExperienceData(html, actor) {
    const sources = [];
    
    // Collect all source data
    html.querySelectorAll('.source-row').forEach(row => {
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
    
    // Update actor data
    const updateData = {
      "system.experience.sources": sources
    };

    // If this is the first time setting up sources, migrate current experience value
    if (!actor.system.experience.sources && totalFromSources > 0) {
      updateData["system.experience.value"] = totalFromSources;
    }

    await actor.update(updateData);

    // Show success notification
    ui.notifications.info(game.i18n.localize("NOTIFICATION.EXPERIENCE_TRACKER_SAVED"));
  }
}
