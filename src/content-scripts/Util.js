class MD_API_Utility {
    constructor() {
        this.lCode = {'1':'gb','2':'jp'};
    }

    generateRandomHex = (len) => {
        let hex = new Array(len),
            chars = {'10':'A', '11':'B', '12':'C','13':'D','14':'E','15':'F'};
        for (let i = 0; i < len; i++) {
            let N = Math.floor(Math.random()*16);
            if (N > 9) hex[i] = chars[N];
            else hex[i] = `${N}`;
        }
        return hex.join('');
    }
    generateRandomIntArray = (max,len) => {
        let O = new Array(len);
        for (let i = 0; i < len; i++) O[i] = Math.floor(Math.random()*(max+1));
        return O;
    }

    generateRandomIntBetweenRange = (min=0, max=255) => {
        return Math.floor(Math.random()*(max+1-min))+min;
    }

    findLastReadChapter = async function (userId, mangaId, handler) {
        let userData = await handler.lookup('user_manga_data', {id:userId, mangaId :mangaId});
        if (!userData || userData.name === 'Error') return '0';
        return userData.chapter || '0';
    }

    findLastChapterNum = async function (id, handler, lang) {
        let chapters = await handler.lookup('manga_chapters', {id:id});
        chapters = chapters.chapters;

        for (let ch of chapters) {
            if (ch.language === lang) return ch.chapter;
        }
        return '0';
    }

    findFirstChapterLink = async function (id, handler, lang) {
        let chapters = await handler.lookup('manga_chapters', {id:id});
        let min = Number.MAX_SAFE_INTEGER, minChapter = null;

        chapters = chapters.chapters;
        for (let i = 0; i < chapters.length; i++) {
            if (chapters[i].language === lang && parseFloat(chapters[i].chapter) < parseFloat(min)) {
                min = chapters[i].chapter;
                minChapter = chapters[i];
            }
        }
        return minChapter;
    }

    addTestClicky(x, y, height, width, position, text, target, handler, params) {
        let clicky = document.createElement('div');
        clicky.id = 'mdp_testClick';
        let style = (t) => {
            let s = t.style;
            s.position = `${position}`;
            s.width = `max(${width}px, fit-content)`;
            s.height = `${height}px`;
            s.top = `${y}px`;
            s.left = `${x}px`;
        }
        style(clicky);
        clicky.innerText = `${text}`;

        clicky.onmousedown = () => {
            console.log('Click!');
        }
        clicky.onmouseup = () => {
            console.log(`Logging ${params[0]}...`);
            handler.logLookup(...params);
        }

        target.appendChild(clicky);
    }

    async addFirstLinkButton(x,y,position,height,width,divId,linkId,target,handler) {
        let btn = document.createElement('a'),
            firstAvailable,
            firstID,
            chNum,
            link;
        btn.classList.add('MDPlus_Link_Button');
        btn.id = divId;
        btn.innerText = `Read First Chapter`;
        let style = (t) => {
            let s = t.style;
            s.position = `${position}`;
            s.width = `max(${width}px, fit-content)`;
            s.height = `${height}px`;
            s.top = `${y}px`;
            s.left = `${x}px`;
            s.color = 'black';
        }
        style(btn);

        btn.onmouseover = () => {
            btn.style.color = 'white';
        }
        btn.onmouseout = () => {
            btn.style.color = 'black';
        }

        target.appendChild(btn);
        firstAvailable = await this.findFirstChapterLink(linkId, handler, 'gb');
        firstID = firstAvailable.id;
        chNum = firstAvailable.chapter;
        link = `${handler.protocol}://${handler.domain}/chapter/${firstID}`;
        btn.innerText += ` (${chNum})`;
        btn.setAttribute('href',link);
    }

    addCounter(x,y,target) {
        let container = document.createElement('div');
        container.classList.add('MDPlus_Counter_Container');
        let styleContainer = () => {
            let S = container.style;
            S.left = `${x}px`;
            S.top = `${y}px`;
        }
        styleContainer();

        let addReadCounter = (T) => {
            let read = document.createElement('div');
            read.classList.add('MDPlus_Counter_Read');
            read.classList.add('mdp_counter');
            read.innerText = '?';
            T.appendChild(read);
        }
        let addMaxCounter = (T) => {
            let count = document.createElement('div');
            count.classList.add('MDPlus_Counter_Max');
            count.classList.add('mdp_counter');
            count.innerText = '?';
            T.appendChild(count);
        }
        let addDivider = (T) => {
            let D = document.createElement('div');
            D.classList.add('MDPlus_Counter_Divide');
            D.classList.add('mdp_counter');
            D.innerText = '/';
            T.appendChild(D);
        }

        addReadCounter(container);
        addDivider(container);
        addMaxCounter(container);

        target.appendChild(container);
    }
    setCounters = async function(containerArray, handler) {
        for (let C of containerArray) {
            let id = C.parentElement.dataset.id,
                readContainer = C.querySelector('.MDPlus_Counter_Read'),
                lastContainer = C.querySelector('.MDPlus_Counter_Max');
            let last = await this.findLastChapterNum(id, handler, 'gb');
            let read = await this.findLastReadChapter('me', id, handler);
            readContainer.innerText = read;
            lastContainer.innerText = last;
        }
    }

    setMainPageCounters = function(handler) {
        let mainPageTiles = new Set(),
            latestLinks = document.querySelector('#latest_update').querySelectorAll('a'),
            followsLinks = document.querySelector('#follows_update').querySelectorAll('a'),
            listGroup = document.querySelectorAll('.list-group-item'),
            counters = [];

        latestLinks.forEach(link=>mainPageTiles.add(link.parentElement.parentElement));
        followsLinks.forEach(link=>mainPageTiles.add(link.parentElement.parentElement));
        
        mainPageTiles = Array.from(mainPageTiles);
        listGroup = Array.from(listGroup);

        for (let i = 0; mainPageTiles.length > listGroup.length ? i < mainPageTiles.length : i < listGroup.length; i++) {
            let mCur, gCur, mID, gID;
            if (i < mainPageTiles.length) {
                mCur = mainPageTiles[i];
                mID = mCur.innerHTML.match(/(?<=\/title\/)\d{1,}/);
                if (mID !== null) {
                    mCur.dataset.id = mID;
                    this.addCounter(0,0,mCur);
                    counters.push(mCur.querySelector('.MDPlus_Counter_Container'));
                }
            }
            if (i < listGroup.length) {
                gCur = listGroup[i];
                gID = gCur.innerHTML.match(/(?<=\/title\/)\d{1,}/);
                if (gID !== null) {
                    gCur.dataset.id = gID;
                    this.addCounter(0,0,gCur);
                    counters.push(gCur.querySelector('.MDPlus_Counter_Container'));
                }
            }
        }
        if (counters.length > 0) this.setCounters(counters, handler);
        
    }

    setTitleCardCounters = function(cards,handler) {
        if (cards.length > 0) {
            cards.forEach(M=> {
                Util.addCounter(10,0,M);
            });
            let counters = document.querySelectorAll('.MDPlus_Counter_Container');
            if (counters.length > 0) {
                Util.setCounters(counters, handler);
            }
        }
    }

    addLinkButtonFromRowItem(x,y,position,height,width,divId,target,rowItem) {
        let btn = document.createElement('a'),
            chNum = `${rowItem.dataset.chapter}`,
            link = `https://mangadex.org/chapter/${rowItem.dataset.id}`;
        btn.classList.add('MDPlus_Link_Button');
        btn.setAttribute('href',link);
        btn.id = divId;
        btn.innerText = `Read First Chapter`;
        btn.innerText += ` (${chNum})`;
        let style = (t) => {
            let s = t.style;
            s.position = `${position}`;
            s.width = `max(${width}px, fit-content)`;
            s.height = `${height}px`;
            s.top = `${y}px`;
            s.left = `${x}px`;
            s.color = 'black';
        }
        style(btn);

        btn.onmouseover = () => {
            btn.style.color = 'white';
        }
        btn.onmouseout = () => {
            btn.style.color = 'black';
        }

        target.appendChild(btn);
    }

    setFirstChapterBtn = function(nodelist) {
        let currentPageMangaId = document.URL.match(/(?<=\/)\d{1,}(?=\/{0,1})/),
            card = document.querySelector('.card-body'),
            cardRows = card.querySelectorAll('.row'),
            firstAvailable = Array.from(nodelist).reduce((a,b)=>parseFloat(a.chapter) < parseFloat(b.chapter) ? a : b ),
            lastRow;
        console.log(firstAvailable);
        if (currentPageMangaId.length > 0 && cardRows.length > 0) {
            lastRow = cardRows[cardRows.length-1];
            currentPageMangaId = currentPageMangaId[0];
            console.log('Title Page Detected\n', [currentPageMangaId, lastRow]);

            this.addLinkButtonFromRowItem(185,0,'relative',25,100,'MDPlus_FirstChap_Go',lastRow,firstAvailable);
        }
    }

    lookupSetFirstChapterBtn = function(handler) {
        let currentPageMangaId = document.URL.match(/(?<=\/)\d{1,}(?=\/{0,1})/),
            card = document.querySelector('.card-body'),
            cardRows = card.querySelectorAll('.row'),
            lastRow;
        if (currentPageMangaId.length > 0 && cardRows.length > 0) {
            lastRow = cardRows[cardRows.length-1];
            currentPageMangaId = currentPageMangaId[0];
            console.log('Title Page Detected\n', [currentPageMangaId, lastRow]);

            this.addFirstLinkButton(185,0,'relative',25,100,'MDPlus_FirstChap_Go',currentPageMangaId,lastRow,handler);
        }
    }
    
    randomBackgroundWithinColorRange = function(target, R=[0,255], B=[0,255], G=[0,255], A=1) {
        let [lowR,highR] = R,
            [lowG,highG] = G,
            [lowB,highB] = B,
            alpha = A;
        target.style.background = `rgba(${this.generateRandomIntBetweenRange(lowR,highR)}, ${this.generateRandomIntBetweenRange(lowG,highG)}, ${this.generateRandomIntBetweenRange(lowB,highB)}, ${alpha})`;
    }

    setColorizedBackgrounds = function(nodeList, R=[0,255], B=[0,255], G=[0,255], A=1) {
        nodeList.forEach(node=>this.randomBackgroundWithinColorRange(node,R,G,B,A));
    }
}

export const Util = new MD_API_Utility();