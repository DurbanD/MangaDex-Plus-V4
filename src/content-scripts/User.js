export class User {
  constructor(id, apiHandler) {
    this.accountID = id
    this.apiHandler = apiHandler
    this.settings
    this.info
    this.followed
    this.ratings
    this.relations
    this.tags
    this.followedIDSet = new Set()
    this.startup()
    
    this.lCode = {'1':'gb','2':'jp'}; // Needs Removed
  }

  // Startup method to initialize async values
  async startup() {
    this.settings = await this.apiHandler.lookup( 'user_settings', { id: this.accountID })
    this.info
    await this.apiHandler.lookup( 'user', { id: this.accountID } ).then(res=>{
      this.info = res
      if (this.accountID === 'me') this.accountsID = res.id
    })
    await this.apiHandler.lookup('user_followed_manga', { id: this.accountID }).then(res=>{
      res.forEach(m=>this.followedIDSet.add(m.mangaId))
      this.followes = res
    })
    this.ratings = await this.apiHandler.lookup( 'user_ratings', { id: this.accountID} )
    this.relations = await this.apiHandler.lookup( 'relations', {} )
    this.tags = await this.apiHandler.lookup( 'all_tags', {} )
  }

  generateRandomIntBetweenRange = (min=0, max=255) => {
      return Math.floor(Math.random()*(max+1-min))+min;
  }

  findLastReadChapter = async function (userId, mangaId) {
    if (this.followedIDSet.has(parseInt(mangaId)) || this.followedIDSet.has(`${mangaId}`)) {
      let userData = await this.apiHandler.lookup('user_manga_data', { id: userId, mangaId: mangaId });
      if (!userData || userData.name === 'Error') return '0';
      else return userData.chapter
    }
    else return '0'
  }

  findLastChapterNum = async function (id, lang) {
      let chapters = await this.apiHandler.lookup('manga_chapters', {id:id});
      chapters = chapters.chapters;

      for (let ch of chapters) {
          if (ch.language === lang) return ch.chapter;
      }
      return '0';
  }

  findFirstChapterLink = async function (id, lang) {
      let chapters = await this.apiHandler.lookup('manga_chapters', {id:id});
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

  addTestClicky(x, y, height, width, position, text, target, params) {
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
          this.apiHandler.logLookup(...params);
      }

      target.appendChild(clicky);
  }

  async addFirstLinkButton(x,y,position,height,width,divId,linkId,target) {
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
      firstAvailable = await this.findFirstChapterLink(linkId, 'gb');
      firstID = firstAvailable.id;
      chNum = firstAvailable.chapter;
      link = `https://www.mangadex.org/chapter/${firstID}`;
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
  setCounters = async function(containerArray) {
      for (let C of containerArray) {
          let id = C.parentElement.dataset.id,
              readContainer = C.querySelector('.MDPlus_Counter_Read'),
              lastContainer = C.querySelector('.MDPlus_Counter_Max');
          await this.findLastChapterNum(id, 'gb').then(last=>{
            lastContainer.innerText = last
          });
          await this.findLastReadChapter(this.accountID, id).then(read=>{
            readContainer.innerText = read;
          });
      }
  }

  setMainPageCounters = function() {
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
      if (counters.length > 0) this.setCounters(counters);
      
  }

  setTitleCardCounters = function(cards) {
      if (cards.length > 0) {
          cards.forEach(M=> {
              this.addCounter(10,0,M);
          });
          let counters = document.querySelectorAll('.MDPlus_Counter_Container');
          if (counters.length > 0) {
              this.setCounters(counters);
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
      if (currentPageMangaId.length > 0 && cardRows.length > 0) {
          lastRow = cardRows[cardRows.length-1];
          currentPageMangaId = currentPageMangaId[0];

          this.addLinkButtonFromRowItem(185,0,'relative',25,100,'MDPlus_FirstChap_Go',lastRow,firstAvailable);
      }
  }

  lookupSetFirstChapterBtn = function() {
      let currentPageMangaId = document.URL.match(/(?<=\/)\d{1,}(?=\/{0,1})/),
          card = document.querySelector('.card-body'),
          cardRows = card.querySelectorAll('.row'),
          lastRow;
      if (currentPageMangaId.length > 0 && cardRows.length > 0) {
          lastRow = cardRows[cardRows.length-1];
          currentPageMangaId = currentPageMangaId[0];

          this.addFirstLinkButton(185,0,'relative',25,100,'MDPlus_FirstChap_Go',currentPageMangaId,lastRow);
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