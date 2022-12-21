//------------------------ --Global scope decleration ------------------------------------//
const submitButton = qs('#submit')
const clearInputButton = qs('#clearInput')
const cardListContainer = qs('.cardList')
const bodyField = qs('textarea')
const nameField = qs('input[type="text"]')
const imageField = qs('#file')
const cardTemplate = qs('template')

cardListContainer.innerHTML = 'No post found'
//--------------------------selector function ----------------------------------------//
function qs(selector, parent=document ){
   return parent.querySelector(selector)
}

//------------------------------ Clear user-input----------------------------------------//
clearInputButton.addEventListener('click', (e) => {
   e.preventDefault()
     nameField.value = ''
     bodyField.focus()
     bodyField.value = ''
})

submitButton.addEventListener('click', (e)  => {
   e.preventDefault()
    const buttonValue = submitButton.textContent
    let inputFields = { name:nameField.value, body:bodyField.value }
    //---------------------------  Submit section goes here  -----------------------------//
    if( buttonValue === 'submit') {
          try {
                  const fileSize = imageField.files[0].size
                  const reader = new FileReader()         
                   reader.addEventListener('load', () => {
                   const imageResult = reader.result
                   postData({...inputFields, image:imageResult }, '/')

                 })
                    reader.readAsDataURL(imageField.files[0])
          } catch (error) { alert('please select an image...') }
    }

   //---------------------------  Edit section goes here  -----------------------------//
    if( buttonValue === 'edit') {
        if(!imageField.files[0]){
            postData({...inputFields, postId:submitButton.id}, '/edit')
        }else {
                 const fileSize = imageField.files[0].size
                  const reader = new FileReader()         
                   reader.addEventListener('load', () => {
                   const imageResult = reader.result
                  postData({...inputFields, postId:submitButton.id, image:imageResult }, '/edit')

                 })
                    reader.readAsDataURL(imageField.files[0])  
                    submitButton.innerText = 'submit'    
        }
    } 
})

 //----------------------------------------------Posting data to DB function---------------------------//
async function postData(postField, url) {
     try {
         const response = await fetch(url, {
             method:'POST',
             body:JSON.stringify(postField),
             headers:{ 'Content-Type':'application/json' }
      })
      const res = await response.json()
      if( typeof res === 'object' && !res.isEdited ) {
            const { _id, name, body, imagePath } = res
            submitButton.innerText = 'uploading...'
            submitButton.disabled = true
            bodyField.value = ''
            nameField.value = ''
            imageField.value = ''
            setTimeout( () => { 
               submitButton.innerText = 'submit'
               submitButton.disabled = false 
               cardListContainer.innerHTML = ''
               addPost(res)
         }, 2500)
      }

      if( typeof res === 'object' && res.isEdited) {
         const { _id, name, body, imagePath } = res._doc
         const postCard = document.getElementById(_id + 'post-card')
         qs('#name', postCard).innerText = name
         qs('#body', postCard).innerText =body
         qs('img', postCard).src = `/image/${imagePath}`
      }

         
     } catch (error) {alert(error.message) }
}
//----------------------- Feching data from DB function via fetch api-------------------------------//
async function fetchPost(url){
     try {
            const response = await fetch(url)
            const res = await response.json()
             return res
     } catch (error) { alert(error.message) }
      
}

//---------------------Feching all post from databae--------------------------------------------//

fetchPost('/posts').then( posts => {
   if( typeof posts === 'object'){
       posts.map( post => {
         cardListContainer.innerHTML = ''
            addPost(post)               
          return
       })
   }
   
}).catch(err => {
   cardListContainer.innerText = err.message
})

//----------------------------------add/display post goes here--------------------------------//

function addPost(post) {
      
          const postCard = cardTemplate.content.cloneNode(true).children[0]
          const name = qs('#name', postCard)
          const body = qs('#body', postCard)
          const image = qs('img', postCard)
          const editButton = qs('.edit', postCard)
          const deleteButton = qs('#delete', postCard)
          postCard.id = post._id + 'post-card'
          name.innerText = post.name
          body.innerText = post.body
          image.src = `/image/${post.imagePath}`
          editButton.id = post._id
          cardListContainer.append(postCard)
          editButton.addEventListener('click', () => { editPostFn(post._id) })       
          deleteButton.addEventListener('click', () => { deletePostFn(post._id, postCard)  }) 
}
//----------------------------------- postCard edit button--------------------------------------//
function editPostFn(postId) {
   submitButton.innerText = 'edit'
   submitButton.id = postId
    fetchPost(`/post/${postId}`).then( post => {
      const { name, body, imagePath, _id } = post
        bodyField.value = body
        nameField.value = name
    })
}
//--------------------------------------------------- Delete post button----------------------------//
function deletePostFn(postId, postCard){
   const deletePost = fetchPost(`/delete/${postId}`)
  
   deletePost.then( post => {
      if( typeof post === 'object'){
         cardListContainer.removeChild(postCard)
          if(cardListContainer.innerHTML == ''){
              cardListContainer.innerHTML = 'No post found'
        }
      }
   }).catch((err => alert(err.message)))
}