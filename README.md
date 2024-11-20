# addtofavorites README

Adds an explorer view to store your favortie folders of your workspace.

## Features

You can add favorites via the context menu of the explorer view.

![contextual menu](/.github/menu.png)

A prompt will appear to enter a name for the favorite.

And you'll see the favorite in the explorer view.

![favorite view](/.github/favoritesView.png)

## Extension Settings

This extension contributes the following settings:

- `addtofavorites.folders`: An array of folders that are added to the favorites view.

```json
"addtofavorites.folders": [
  {
    "uri": "file:///path/to/folder",
    "name": "🚀 My custom name"
  },
  {
    "uri": "file:///path/to/another/folder",
    "name": "🧨 Boom"
  }
]
```

## Release Notes

### 1.0.0

Initial release
