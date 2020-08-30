-> title

== title ==

The Underground River

by @redmountainman1 for Vulcan Jam 3

 + [New Game]
   :newgame
   -> DONE
 + [Help] -> help

== help ==

Your token on the map is \%c\{\#f6ad0f\}@\%c\{\}

Use the arrow keys to move.

:br

You play by moving around the map, searching and fighting.

The map only extends to the bounds of the window.
Enemies will appear as tokens on the map. Be careful!
To attack an enemy, move towards it.

:br

-> title

== level1 ==

Your electric torch flickers off the cave walls.

:br

You're looking for the boy. His friends said he crawled down the sinkhole earlier in the day.

:br

It looks scary down here. It looks like a network of passages with a stream flowing through them.

 + [Call up for help] ->
   The police officer tosses you a helmet.
   :levelup, defense
   -> DONE
 + [Look around] ->
   You find a \%c\{\#d3473d\}swiss army knife\%c\{\} on the cave ground.
   :levelup, attack
   -> DONE
 + [Bravely push forward] ->
   You are filled with courage.
   :levelup, hp
   -> DONE

-> DONE

== level2 ==

You come to another hole.

 + [Investigate]
   There are small footprints near here. Perhaps they belong to the boy?
   :br
   -> level2
 + [Go down]
   You descend down the hole, and slip on the steep slope.
   -> DONE

== level3 ==

The underground river continues on here. You see small footprints.

You must be on the right track.

-> DONE

== level4 ==

The underground river goes through a narrow passage here. You see light ahead.

:br

The boy gives you a hug as you finally make your way out, several miles from town.

:br

The stream connects here with a larger river. The boy sits down, breathless, as you wave and shout at curious onlookers on a passing riverboat.

:br
:restart

-> DONE

== missing_boy ==

It looks like this leads out, but where is the boy?

I don't see his footprints here. He must still be in the cave somewhere.

-> DONE

== boy ==

The boy cowers from you.

:br

"Have no fear, I'm Dr. Lewis, you say. I'm here to help."

The boy looks at you and smiles, taking your hand.

"Please help, I'm very lost."

:boy
:br

-> DONE

== gameover ==

You died.

:br
:restart

-> DONE


== levelup ==

You've leveled up! How would you like to spend your experience?

 + [Increase HP] ->
   :levelup, hp
   -> DONE
 + [Increase Attack] ->
   :levelup, attack
   -> DONE
 + [Increase Defense] ->
   :levelup, defense
   -> DONE

== ghost ==

You see the ghost of an old confederate soldier ahead. His spectral face is full of hatred as he reaches for his sword.

-> DONE

== printing_press ==

A printing press is setup down here. You see many pages scattered around, some dated from the early 1800's.

:br

One pamphlet reads:

"If there is no struggle, there is no progress. Those who profess to favor freedom, and deprecate agitation, are men who want crops without plowing up the ground, they want rain without thunder and lightning.

-- Frederick Douglass"

:br

You find a map of the underground river. This could be useful.
:map

-> DONE

== dinosaur_skeleton ==

You come across a skeleton of a large, aquatic dinosaur. There is a native american tomahawk wedged in its skull.

 + [Leave it alone]
   It is wise to leave ancient artifacts alone.
   :levelup, hp
   -> DONE
 + [Take it]
   You take the stone tomahawk. It is ancient, but still razor sharp.
   :levelup, weapon, 2
   -> DONE

There is a
