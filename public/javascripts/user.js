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
    fetch(`api/user/${jwtToken}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(r => r.json()).then(r => {
      if (r.status == 200) {
        this.renderUserData()
      } else if (r.status == 400) {
        this.logout()
      } else if (r.status == 500) {
        alert(r.msg)
      }
    })
  }

  static async fetchPersonalData () {
    let jwtToken = localStorage.getItem('jwt')
    return (await fetch(`api/user/${jwtToken}`)).json()
  }

  static async renderUserData () {
    let response = await this.fetchPersonalData()
    console.log(response.status);
    
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

  static loginWithGoogle () {
    let provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider).then(result => {
      let token = result.credential.accessToken
      let user = result.user
      fetch(`api/user/${token}`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => r.json()).then(r => {
        if (r.status == 200) {
          localStorage.setItem('jwt', r.token)
          this.showPage('personal')
          this.renderUserData()
        }
      })
    }).catch(error => {
      console.log(error)
    })    
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