What advice would I give to myself if I were to start a project like this again?
    At the very start of the project, test every single idea you have on a small scale to be absolutely sure it works. This gives you enough time to realize if something requires more attention than you initially thought, and ample time to divy up your schedule accordingly.

Did I complete everything in your "needs to have" list?
    Mostly. "Performance optimization" was kind of vague but I did manage to implement backface culling, which likely cut the processing needed by half. And though world saving is an implemented feature, it is mostly pointless if you can't break or place blocks.

What was the hardest part of the project?
    Coding gravity, collisions, and camera movement from scratch without any libraries. It was extremely rewarding when it finally worked but the process was excruciatingly frustrating.

Were there any problems you could not solve?
-   A better world saving system. Currently, due to the limit imposed by localStorage, the world size is restricted to 255x40x255, which is extremely small considering the program can generate a 1000x1000 world in the blink of an eye. To fix this problem would have required me to learn another way of storing data locally, like Web SQL or IndexedDB, which I had no time for.
-   Implementing a menu. I initially envisioned the game to have five save slots, access to which would be available in a fullscreen menu when escape was pressed. But due to the unique way p5js works, I was unable to overlay a 2D canvas atop the WebGL canvas without dipping my toes into instance mode which I, again, did not have time for.
-   Getting stuck in blocks. Sometimes when landing on a block edge or corner at just the right angle, the player can get stuck on the edge or corner. I suspect this has to do with the way my collision system was written, but I have no idea how to fix it
-   Landing inside blocks when falling from high up. Sometimes when landing from a really high fall, the player clips through and get stuck in the surface block. This likely happens when the velocity becomes greater than the width of a block.
-   Lack of head collision. This did not become an issue until trees were implemented, because up until then there was nothing for the head to impact. But by the time I realized this issue I had already run out of time to implement a solution.