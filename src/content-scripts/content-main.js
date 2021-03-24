import {MD_Handler} from './MD-API-Handler';
import {Util} from './Util';
import './mdp_style.css';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

export const runMain = function() {
    let mangaEntries;

    mangaEntries = document.querySelectorAll('.manga-entry');
    if (mangaEntries.length > 0) {
        Util.setColorizedBackgrounds(mangaEntries,[20,70],[5,50],[20,70],0.35);
        Util.setTitleCardCounters(mangaEntries,MD_Handler);
    }

    if (/^https{0,1}:\/\/(www\.){0,1}mangadex.org\/{0,1}$/.test(document.URL)) {
        let containers;
        Util.setMainPageCounters(MD_Handler);
        containers = document.querySelectorAll('.MDPlus_Counter_Container');
        Util.setColorizedBackgrounds(Array.from(containers).map(i=>i.parentElement),[20,70],[5,50],[20,70],0.35);
    }

    if (/\/title\//.test(document.URL)) {
        let chList = document.querySelectorAll('.chapter-row');
        if (chList.length >= 100 ) Util.lookupSetFirstChapterBtn(MD_Handler);
        else Util.setFirstChapterBtn(chList);
    }
}

// Util.addTestClicky(15, 75, 25, 75, 'fixed', `Log Current User`, document.body, MD_Handler, ['user', {id:'me'}]);