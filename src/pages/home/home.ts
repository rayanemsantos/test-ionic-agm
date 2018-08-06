import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { ChatProvider } from '../../providers/chat/chat'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  nickname = ''
  employer = ''
  employers = [];
  conversas: any = []
  conversas_chamei: any = []
  messages = [];
  pet = "kittens"
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, 
              private socket: Socket, public chatProvider: ChatProvider) {
    this.employers = [
      {name: 'Rayane'},
      {name: 'Lucas'},
      {name: 'José'},
      {name: 'Bruno'},
    ];
    //recebe mensagens            
    this.getMessages().subscribe(message => {
      this.messages.push(message);
      console.log('escutando from outside', message)
    });
    //escuta convites
    this.listenInviteToJoin().subscribe(data => {
      if(data['user_room'] == this.nickname){
        console.log('eu' + data['user_room'] + 'fui convidado pelo:' + data['user_host_room'])
        console.log(data)
        // this.conversas.push(data)
        this.pet = "kittens"
      } 
      // else if(data['user_room'] == this.employer && data['user_host_room'] == this.nickname) {
      //   this.conversas_chamei.push(data)
      //   this.pet = "kittens"
      // }
    });
   }
   getChats(){
    console.log(this.nickname)
    this.socket.emit('getChatList', this.nickname);
    this.chatProvider.getChat(this.nickname).then((data) => {
      this.conversas_chamei  = data.chatList
      console.log(data)
    })
   }
   // recebe mensagens
   getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('messageToOutside', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
   //simboliza o nome dos dois participantes da conversa, podendo vir a ser o email cadastrado
  setNickname(nickname){
    this.nickname = nickname
  }

  toInviteAndOpenChat(user_room, socket_session){
    setTimeout(() => {
      let room_id = socket_session.id
      this.socket.emit('room', { user_room: user_room, user_host_room: this.nickname, room_id:room_id });
      let chat = { user_room: user_room, user_host_room: this.nickname, room_id:room_id }
      let profileModal = this.modalCtrl.create('ChatRoomPage', {chat:chat, current_user: this.nickname});
      profileModal.present();
    }, 1000);
  }

  // só quem pode iniciar uma conversa é o jober.
  createChatSession(user_room){
    this.employer = user_room
    console.log(this.nickname + '' + 'convidou' + '' + user_room)
    let socket_session = this.socket.connect(); 
    console.log(socket_session)
    this.toInviteAndOpenChat(user_room, socket_session)
  }


  //escuta quando alguem me convida para um room
  listenInviteToJoin() {
    let observable = new Observable(observer => {
      this.socket.on('callUser', function(data) {
        observer.next(data);
      });
    })
    return observable;
  }

  //abre a pagina de chat
  goChat(chat){
    console.log(chat)
    this.socket.connect();
    console.log('room_id', chat.room_id)
    this.socket.emit('enterRoom', chat.room_id);
    let profileModal = this.modalCtrl.create('ChatRoomPage', {chat:chat, current_user:this.nickname});
    profileModal.present();
  }
  ionViewWillLoad(){
  }
}