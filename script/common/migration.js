export const migrateWorld = async () => {
    const schemaVersion = 6;
    const worldSchemaVersion = Number(game.settings.get("dark-heresy", "worldSchemaVersion"));
    if (worldSchemaVersion !== schemaVersion && game.user.isGM) {
        ui.notifications.info("Upgrading the world, please wait...");
        for (let actor of game.actors.contents) {
            try {
                const update = migrateActorData(actor, worldSchemaVersion);
                if (!isObjectEmpty(update)) {
                    await actor.update(update, {enforceTypes: false});
                }
            } catch(e) {
                console.error(e);
            }
        }
        for (let pack of
            game.packs.filter(p => p.metadata.package === "world" && ["Actor"].includes(p.metadata.type))) {
            await migrateCompendium(pack, worldSchemaVersion);
        }
        game.settings.set("dark-heresy", "worldSchemaVersion", schemaVersion);
        ui.notifications.info("Upgrade complete!");
    }
};

const migrateActorData = (actor, worldSchemaVersion) => {
    const update = {};
    if (worldSchemaVersion < 1) {
        if (actor.data.type === "acolyte" || actor.data.type === "npc") {
            actor.data.skills.psyniscience.characteristics = ["Per", "WP"];
            update["system.skills.psyniscience"] = actor.data.data.skills.psyniscience;
        }
    }
    if (worldSchemaVersion < 2) {
        if (actor.data.type === "acolyte" || actor.data.type === "npc") {

            let characteristic = actor.data.characteristics.intelligence.base;
            let advance = -20;
            let total = characteristic.total + advance;

            actor.data.data.skills.commonLore.specialities.vertexSubSector = {
                label: "Vertex SubSector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.commonLore.specialities.calixisSector = {
                label: "Calixis Sector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            update["system.skills.commonLore"] = actor.data.data.skills.commonLore;

            actor.data.data.skills.forbiddenLore.specialities.officioAssassinorum = {
                label: "Officio Assassinorum",
                isKnown: false,
                advance: advance,
                total: total,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.pirates = {
                label: "Pirates",
                isKnown: false,
                advance: advance,
                total: total,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.psykers = {
                label: "Psykers",
                isKnown: false,
                advance: advance,
                total: total,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.theWarp = {
                label: "The Warp",
                isKnown: false,
                advance: advance,
                total: total,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.xenos = {
                label: "Xenos",
                isKnown: false,
                advance: advance,
                total: total,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.astromancy = {
                label: "Astromancy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.beasts = {
                label: "Beasts",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.bureaucracy = {
                label: "Bureaucracy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.chymistry = {
                label: "Chymistry",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.cryptology = {
                label: "Cryptology",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.heraldry = {
                label: "Heraldry",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.imperialWarrants = {
                label: "Imperial Warrants",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.judgement = {
                label: "Judgement",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.legend = {
                label: "Legend",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.numerology = {
                label: "Numerology",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.occult = {
                label: "Occult",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.philosophy = {
                label: "Philosophy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.tacticaImperialis = {
                label: "Tactica Imperialis",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.adeptaSororitas = {
                label: "Adepta Sororitas",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.adeptusArbites = {
                label: "Adeptus Arbites",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.adeptusAstartes = {
                label: "Adeptus Astartes",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.adeptusAstraTelepathica = {
                label: "Adeptus Astra Telepathica",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.adeptusMechanicus = {
                label: "Adeptus Mechanicus",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.administratum = {
                label: "Administratum",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.askellonSector = {
                label: "Askellon Sector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.chartistCaptains = {
                label: "Chartist Captains",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.collegiaTitanicu = {
                label: "Collegia Titanicu",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.ecclesiarchy = {
                label: "Ecclesiarchy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.imperialCreed = {
                label: "Imperial Creed",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.imperialGuard = {
                label: "Imperial Guard",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.imperialNavy = {
                label: "Imperial Navy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.imperium = {
                label: "Imperium",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.navigators = {
                label: "Navigators",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.planetaryDefenceForces = {
                label: "Planetary Defence Forces",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.rogueTraders = {
                label: "Rogue Traders",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.scholaProgenium = {
                label: "Schola Progenium",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.tech = {
                label: "Tech",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.underworld = {
                label: "Underworld",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.war = {
                label: "War",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.vertexSubSector = {
                label: "Vertex SubSector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.forbiddenLore.specialities.calixisSector = {
                label: "Calixis Sector",
                advance: advance,
                isKnown: false,
                cost: 0
            };

            update["system.skills.forbiddenLore"] = actor.data.data.skills.forbiddenLore;

            actor.data.data.skills.scholasticLore.specialities.adeptaSororitas = {
                label: "Adepta Sororitas",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.adeptusArbites = {
                label: "Adeptus Arbites",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.adeptusAstartes = {
                label: "Adeptus Astartes",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.adeptusAstraTelepathica = {
                label: "Adeptus Astra Telepathica",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.adeptusMechanicus = {
                label: "Adeptus Mechanicus",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.administratum = {
                label: "Administratum",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.askellonSector = {
                label: "Askellon Sector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.chartistCaptains = {
                label: "Chartist Captains",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.collegiaTitanicu = {
                label: "Collegia Titanicu",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.ecclesiarchy = {
                label: "Ecclesiarchy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.imperialCreed = {
                label: "Imperial Creed",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.imperialGuard = {
                label: "Imperial Guard",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.imperialNavy = {
                label: "Imperial Navy",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.imperium = {
                label: "Imperium",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.navigators = {
                label: "Navigators",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.planetaryDefenceForces = {
                label: "Planetary Defence Forces",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.rogueTraders = {
                label: "Rogue Traders",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.scholaProgenium = {
                label: "Schola Progenium",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.tech = {
                label: "Tech",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.underworld = {
                label: "Underworld",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.war = {
                label: "War",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.vertexSubSector = {
                label: "Vertex SubSector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            actor.data.data.skills.scholasticLore.specialities.calixisSector = {
                label: "Calixis Sector",
                advance: advance,
                isKnown: false,
                cost: 0
            };
            update["system.skills.scholasticLore"] = actor.data.data.skills.scholasticLore;

        }

    }

    // // migrate aptitudes
    if (worldSchemaVersion < 4) {
        if (actor.data.type === "acolyte" || actor.data.type === "npc") {

            let textAptitudes = actor.data.data?.aptitudes;

            if (textAptitudes !== null && textAptitudes !== undefined) {
                let aptitudeItemsData =
                    Object.values(textAptitudes)
                    // Be extra careful and filter out bad data because the existing data is bugged
                        ?.filter(textAptitude =>
                            "id" in textAptitude
                        && textAptitude?.name !== null
                        && textAptitude?.name !== undefined
                        && typeof textAptitude?.name === "string"
                        && 0 !== textAptitude?.name?.trim().length)
                        ?.map(textAptitude => {
                            return {
                                name: textAptitude.name,
                                type: "aptitude",
                                isAptitude: true,
                                img: "systems/dark-heresy/asset/icons/aptitudes/aptitude400.png"
                            };
                        });
                if (aptitudeItemsData !== null && aptitudeItemsData !== undefined) {
                    actor.createEmbeddedDocuments("Item", [aptitudeItemsData]);
                }
            }
            update["system.-=aptitudes"] = null;
        }
    }
    if (worldSchemaVersion < 3) {
        actor.prepareData();
        update["system.armour"] = actor.data.armour;
    }

    if (worldSchemaVersion < 5) {
        actor.prepareData();
        let experience = actor.data.data?.experience;
        let value = (experience?.value || 0) + (experience?.totalspent || 0);
        // In case of an Error in the calculation don't do anything loosing data is worse
        // than doing nothing in this case since the user can easily do this himself
        if (!isNaN(value) && value !== undefined) {
            update["system.experience.value"] = value;
        }
    }

    if (worldSchemaVersion < 6) {
        actor.prepareData();
        if (actor.type === "npc") {
            if (actor.system.bio?.notes) {
                actor.system.notes = actor.system.bio.notes;
            }
        }
    }

    return update;
};

/**
 * Migrate Data in Compendiums
 * @param {CompendiumCollection} pack
 * @param {number} worldSchemaVersion
 * @returns {Promise<void>}
 */
export const migrateCompendium = async function(pack, worldSchemaVersion) {
    const entity = pack.metadata.type;

    await pack.migrate();
    const content = await pack.getContent();

    for (let ent of content) {
        let updateData = {};
        if (entity === "Actor") {
            updateData = migrateActorData(ent, worldSchemaVersion);
        }
        if (!isObjectEmpty(updateData)) {
            foundry.utils.expandObject(updateData);
            updateData._id = ent.id;
            await pack.updateEntity(updateData);
        }
    }
};
