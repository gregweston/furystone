# Fury Stone

Fury Stone is a customizable browser game. It includes a basic code editor interface, allowing users to control the game logic and level design using Javascript code.

## Customizing the Game

Coding your own customized version of Fury Stone is done via the `GameBuilder` class, which can be instantiated in the editor like this:

```
let builder = new GameBuilder()
```

From there you can call other methods on `builder` to do things like set the map and add enemies. 

```
builder.set_map("skull")
builder.add_enemy("ogre", 400, 120)
```

After that, the game must be started:

```
builder.start_game()
```

Click the "Run" button underneath the editor to run your code and play the game in the Viewer on the right side.

## Code Templates

This was designed as a guided learning tool, so the game won't be fully functional until certain methods and event handlers are in place. To get an idea of what a "finished" game looks like, you can click the "Load Code" button in the top right and choose the "Example Game" template. There's also a blank canvas "Starter Template" that just gets the game running.

## Running Your Own Instance

Assuming you are already set up with a local webserver, you can follow these steps to get Fury Stone up and running locally.

```
git clone git@github.com:gregweston/furystone.git
cd furystone
npm install
npm run bundle_editor
npm run bundle_gamebuilder
```

Set your server's document root to `furystone/public/` and you should be set.

## About

The underlying source code for the game uses [Phaser](https://phaser.io). The editor interface is built with [CodeMirror](https://codemirror.net/).

These assets are also used:

- [Dungeon Tileset II by 0x72](https://0x72.itch.io/dungeontileset-ii)
- [Pixel Art Effects by Zowie Pixel Art](https://pixel-zowie.itch.io/1630-pixel-art-effects-all-in-one-season-1)
- [Monogram (font) by datagoblin](https://datagoblin.itch.io/monogram)