import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const EXTENSION_NAME = "addtofavorites";
const FAVORITES_KEY = "folders";
const ADD_COMMAND = "add";
const VIEW = "view";

interface FavoriteFolder {
  uri: vscode.Uri;
  name: string;
}

class FavoritesProvider implements vscode.TreeDataProvider<vscode.Uri> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.Uri | undefined | void
  > = new vscode.EventEmitter<vscode.Uri | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.Uri | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private favoriteFolders: FavoriteFolder[]) {}

  getTreeItem(element: vscode.Uri): vscode.TreeItem {
    const folder = this.favoriteFolders.find(
      (fav) => fav.uri.fsPath === element.fsPath
    );
    const isDirectory = fs.statSync(element.fsPath).isDirectory();
    return {
      resourceUri: folder?.uri,
      label: folder ? folder.name : path.basename(element.fsPath),
      collapsibleState: isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
    };
  }

  getChildren(element?: vscode.Uri): vscode.ProviderResult<vscode.Uri[]> {
    if (!element) {
      return this.favoriteFolders.map((fav) => fav.uri);
    } else {
      if (fs.statSync(element.fsPath).isDirectory()) {
        return this.getFolderChildren(element);
      }
      return [];
    }
  }

  private getFolderChildren(folderUri: vscode.Uri): vscode.Uri[] {
    if (!fs.existsSync(folderUri.fsPath)) {
      return [];
    }
    const files = fs.readdirSync(folderUri.fsPath);
    return files.map((file) =>
      vscode.Uri.file(path.join(folderUri.fsPath, file))
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export function activate(context: vscode.ExtensionContext) {
  let favoriteFolders = loadFavorites();
  const favoritesProvider = new FavoritesProvider(favoriteFolders);

  vscode.window.registerTreeDataProvider(
    `${EXTENSION_NAME}.${VIEW}`,
    favoritesProvider
  );

  const addToFavorites = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.${ADD_COMMAND}`,
    async (resource: vscode.Uri) => {
      const name = await vscode.window.showInputBox({
        prompt: `Enter a name for ${resource.fsPath}`,
        value: path.basename(resource.fsPath),
      });
      if (name) {
        if (
          !favoriteFolders.some((fav) => fav.uri.fsPath === resource.fsPath)
        ) {
          favoriteFolders.push({ uri: resource, name });
          saveFavorites(favoriteFolders);
          favoritesProvider.refresh();
          vscode.window.showInformationMessage(`Added "${name}" to favorites.`);
        } else {
          vscode.window.showInformationMessage(
            `"${name}" is already a favorite.`
          );
        }
      } else {
        vscode.window.showInformationMessage("No name provided.");
      }
    }
  );
  context.subscriptions.push(addToFavorites);

  favoritesProvider.refresh();
}

const loadFavorites = (): FavoriteFolder[] => {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  const storedFavorites = config.get<{ uri: string; name: string }[]>(
    FAVORITES_KEY,
    []
  );
  return storedFavorites.map((fav) => ({
    uri: vscode.Uri.parse(fav.uri),
    name: fav.name,
  }));
};

const saveFavorites = (favoriteFolders: FavoriteFolder[]) => {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
  config.update(
    FAVORITES_KEY,
    favoriteFolders.map((fav) => ({ uri: fav.uri.toString(), name: fav.name })),
    vscode.ConfigurationTarget.Workspace
  );
};

export const deactivate = () => {
  // Clean up resources on deactivation
};
