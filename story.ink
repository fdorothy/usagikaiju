VAR points = 0
VAR size = 1
VAR time = 10
VAR size_cost = 10
VAR time_cost = 10

-> title

== title ==

Usagi Kaiju

by @redmountainman1 for Text Only Jam 2 (8-bits-to-infinity).

 + [New Game]
   :newgame
   -> DONE
 + [Help] -> help

== help ==

Your token on the map is \%c\{\#f6ad0f\}ベ\%c\{\}

Use the arrow keys to move.

:br

You play by moving around the map and eating things to get bigger. The bigger you are, the more things you can eat. Watch out for hostile things! Look for secret stashes!

The map only extends to the bounds of the window.

:br

-> title

== upgrade ==

Time's up. Take a rest and upgrade your powers!

You have {points} points to spend. Upgrade?

 + [Upgrade Size ({size_cost} pts.)] ->
   :upgrade_size
   -> upgrade
 + [Upgrade Time ({time_cost} pts.)] -> 
   :upgrade_time
   -> upgrade
 + [Continue] ->
   :continue
   -> DONE

== valid_selection ==

OK, upgraded.

:br

-> upgrade

== invalid_selection ==

Sorry, that costs too much. Continue the game, eat more to upgrade.

:br

-> upgrade

== level1 ==

You ( \%c\{\#f6ad0f\}ベ\%c\{\} ) cower in the arms of your new masters.

"Oh, what a cute baby rabbit!" they say.

:br

"I wonder why he was around that nuclear power plant all alone."

"Good thing we saved him and brought him home!"

:br

You can smell something. Something...tasy. Everything smells tasty.

Your stomach rumbles.

:br

Your new masters humiliate you as they craddle you in their arms. But you are no fool.

:br

Soon, you will devour them.

:br

They put you down and scatter treats. Eat them to grow big.

:br

Become the rabbit of legends.

:br

Become the great kaiju usagi. It is your destiny.

:br

Happy hunting, little rabbit.

-> DONE
