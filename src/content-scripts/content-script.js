import {MD_Handler} from './MD-API-Handler'
import { User } from './User'
import './mdp_style.css';

const API = MD_Handler
const startActiveUserSession = async function(apiHandler) {
  const user = apiHandler.lookup( 'user', { id: 'me' } )
  let apiUser
  await user.then((res)=>apiUser = new User(res.id, apiHandler))
  return apiUser
}
const ActiveUser = startActiveUserSession(API)

const logUser = async function(user) {
  console.log(await user)
}
const Start = async function() {
  await ActiveUser.then(Usr=>{
    const mangaEntries = document.querySelectorAll('.manga-entry');
    if (mangaEntries.length > 0) {
        Usr.setColorizedBackgrounds(mangaEntries,[20,70],[5,50],[20,70],0.35);
        Usr.setTitleCardCounters(mangaEntries);
    }
    if (/^https{0,1}:\/\/(www\.){0,1}mangadex.org\/{0,1}$/.test(document.URL)) {
      Usr.setMainPageCounters();
      let containers = document.querySelectorAll('.MDPlus_Counter_Container');
      Usr.setColorizedBackgrounds(Array.from(containers).map(i=>i.parentElement), [20,70],[5,50],[20,70],0.35);
    }
    if (/\/title\//.test(document.URL)) {
        let chList = document.querySelectorAll('.chapter-row');
        if (chList.length >= 100 ) Usr.lookupSetFirstChapterBtn();
        else Usr.setFirstChapterBtn(chList);
    }
  }).catch(err=>console.log(err))
}
Start()
logUser(ActiveUser)
