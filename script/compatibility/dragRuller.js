export const init = function ()
{

    Hooks.once("dragRuler.ready", (SpeedProvider) =>
    {
        class DarkHeresySpeedProvider extends SpeedProvider
        {
            get colors()
            {
                return [{
                    id: "halfMove",
                    default: 0xB6D7A8,
                    name: "dark-heresy.system.movement.half"
                },
                {
                    id: "fullMove",
                    default: 0x00FF00,
                    name: "dark-heresy.system.movement.full"
                },
                {
                    id: "charge",
                    default: 0xFFFF00,
                    name: "dark-heresy.system.movementrun.charge"
                },
                {
                    id: "run",
                    default: 0x0000FF,
                    name: "dark-heresy.system.movement.run"
                }
                ];
            }

            getRanges(token)
            {
                const halfMove = token.actor.system.movement.half;
                const fullMove = token.actor.system.movement.full;
                const charge = token.actor.system.movement.charge;
                const run = token.actor.system.movement.run;

                // A character can always walk it's base speed and dash twice it's base speed
                const ranges = [{
                    range: halfMove,
                    color: "halfMove"
                },
                {
                    range: fullMove,
                    color: "fullMove"
                },
                {
                    range: charge,
                    color: "charge"
                },
                {
                    range: run,
                    color: "run"
                }
                ];


                return ranges;
            }
        }

        dragRuler.registerSystem("dark-heresy", DarkHeresySpeedProvider);

    });
};
