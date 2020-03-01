class User {
  
  constructor () {
     
  }

  static async savePersonalData () {
    let jwtToken = localStorage.getItem('jwt')
    let formData = {
      displayName: document.getElementById('displayname').value,
      realName: document.getElementById('realname').value,
      stuID: document.getElementById('stuID').value,
      personalID: document.getElementById('personalID').value,
      school: document.getElementById('school').value
    }
    let apiResponse = await (await fetch(`api/user/${jwtToken}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })).json()
    switch (apiResponse.status) {
      case 200:
        this.renderUserData()
        break
      case 400:
        this.logout()
        break
      case 500:
        alert(apiResponse.msg)
        break
      default:
        break
    }
  }

  static async fetchPersonalData () {
    let jwtToken = localStorage.getItem('jwt')
    return (await fetch(`api/user/${jwtToken}`)).json()
  }

  static async renderUserData () {
    let response = await this.fetchPersonalData()
    if (response.status !== 200) {
      this.logout()
      return
    }
    let data = response.data    
    document.getElementById('displayname').value = data.displayname
    document.getElementById('realname').value = data.realname
    document.getElementById('stuID').value = data.stuID
    document.getElementById('personalID').value = data.personalID
    document.getElementById('school').value = data.school
  }

  static async loginWithGoogle () {
    let provider = new firebase.auth.GoogleAuthProvider()
    let googleLoginResult = await firebase.auth().signInWithPopup(provider)    
    let token = googleLoginResult.credential.accessToken
    let user = googleLoginResult.user
    let apiResponse = await (await fetch(`api/user/${token}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })).json()
    if (apiResponse.status == 200) {
      localStorage.setItem('jwt', apiResponse.token)
      this.showPage('personal')
      this.renderUserData()
    }
  }

  static logout () {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
    }).catch(error => {
      // An error happened.
    })    
    localStorage.setItem('jwt', '')
    this.showPage('login')
  }

  static showPage (page) {
    document.getElementById('login').classIf('active', false)
    document.getElementById('personal').classIf('active', false)
    document.getElementById(page).classList.add('active')
  }
}

export { User }