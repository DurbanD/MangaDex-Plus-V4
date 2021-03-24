class Handler {
    constructor() {
        this.domain = 'mangadex.org';
        this.protocol = 'https';
        this.apiPath = 'api/v2';
        // this.apiURL = `${this.protocol}://${this.domain}/${this.apiPath}`;
        this.apiURL = `https://api.mangadex.org/v2`
    }

    lookup = async function(query,info) {
        let url, data;
        switch (query) {
            case 'index':
                url = `${this.apiURL}/`;
                break;
            case 'user': 
                url = `${this.apiURL}/user/${info.id}`;
                break;
            case 'user_settings':
                url = `${this.apiURL}/user/${info.id}/settings`;
                break;
            case 'user_chapters':
                url = `${this.apiURL}/user/${info.id}/chapters`;
                break;
            case 'user_followed_manga':
                url = `${this.apiURL}/user/${info.id}/followed-manga`;
                break;
            case 'user_followed_updates':
                url = `${this.apiURL}/user/${info.id}/followed-updates`;
                break;
            case 'user_ratings':
                url = `${this.apiURL}/user/${info.id}/ratings`;
                break;
            case 'user_manga_data':
                url = `${this.apiURL}/user/${info.id}/manga/${info.mangaId}`
                break;
            case 'manga':
                url = `${this.apiURL}/manga/${info.id}`;
                break;
            case 'manga_chapters':
                url = `${this.apiURL}/manga/${info.id}/chapters?p=default`;
                break;
            case 'manga_covers':
                url = `${this.apiURL}/manga/${info.id}/covers`;
                break;
            case 'chapter':
                url = `${this.apiURL}/chapter/${info.id}`;
                break;
            case 'group':
                url = `${this.apiURL}/group/${info.id}`;
                break;
            case 'group_chapters':
                url = `${this.apiURL}/group/${info.id}/chapters`;
                break;
            case 'all_tags':
                url = `${this.apiURL}/tag`;
                break;
            case 'tag':
                url = `${this.apiURL}/tag/${info.id}`;
                break;
            case 'follows':
                url = `${this.apiURL}/follows`;
                break;
            case 'relations': 
                url = `${this.apiURL}/relations`
                break;
            default:
                return new Error(`Incorrect query "${query}" for data lookup method. `);
        }
        try {
            let head = new Headers({'Content-Type': 'application/json'}),
                credentials= 'include'
            let response = await fetch(url, { headers: head, credentials: credentials }).catch(err=>console.log(err)),
                json = await response.json();
            data = await json.data;
        }
        catch (err) {
            console.log(`Query failed for ${query}. ${err}`);
            return new Error(`Unable to retrieve requested information. ${err}`);
        }
        return data;
    }

    logLookup = async function(query, info) {
        let T = await this.lookup(query,info);
        return console.log(T);
    }

    getUserEssential = async function() {
        let user, userSettings;
        try {
            user = await this.lookup('user', {id:'me'});
            userSettings = await this.lookup('user_settings', {id:'me'});
        }
        catch (err) {
            return new Error(err);
        }

        return {
            username: user.username,
            id: user.id,
            languages: userSettings.shownChapterLangs
        }
    }
}

export const MD_Handler = new Handler();