import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasePlaylistFolderService } from '../../services/playlist-folder/base-playlist-folder.service';
import { PlaylistFolderModel } from '../../services/playlist-folder/playlist-folder-model';
import { BasePlaylistService } from '../../services/playlist/base-playlist.service';
import { PlaylistModel } from '../../services/playlist/playlist-model';

@Injectable()
export class PlaylistsContextMenu {
    private subscription: Subscription = new Subscription();

    constructor(private playlistFolderService: BasePlaylistFolderService, private playlistService: BasePlaylistService) {}

    public playlists: any = {};

    public async initializeAsync(): Promise<void> {
        this.subscription.add(
            this.playlistFolderService.playlistFoldersChanged$.subscribe(async () => {
                await this.fillPlaylistsAsync();
            })
        );

        this.subscription.add(
            this.playlistService.playlistsChanged$.subscribe(async () => {
                await this.fillPlaylistsAsync();
            })
        );

        this.fillPlaylistsAsync();
    }

    private async fillPlaylistsAsync(): Promise<void> {
        const playlistFolders: PlaylistFolderModel[] = await this.playlistFolderService.getPlaylistFoldersAsync();
        const playlists: PlaylistModel[] = await this.playlistService.getPlaylistsAsync(playlistFolders);

        this.playlists = this.playlistsToJson(playlists);
    }

    private clearPlaylists(): void {
        this.playlists = {};
    }

    private playlistsToJson(playlists: PlaylistModel[]): any {
        return playlists.reduce((json: any, playlist: PlaylistModel) => {
            const objectKey: any = playlist['folderName'];

            if (json[objectKey] == undefined) {
                json[objectKey] = [];
            }

            json[objectKey].push(playlist.name);

            return json;
        }, {});
    }
}