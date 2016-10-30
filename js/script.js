// var API_URL = 'http://brick-by-brick.dev/'
var API_URL = 'http://brick-by-brick.herokuapp.com/'
var TASK = 'select-toponym'

var item = {}
var titleElement = document.getElementById('title')

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    error.status = response.status
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

function postJSON(url, data, callback) {
  fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(function(data) {
      callback(null, data)
    }).catch(callback)
}

function getJSON(url, callback) {
  fetch(url, {
    credentials: 'include'
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(function(data) {
      callback(null, data)
    }).catch(callback)
}

titleElement.addEventListener('keydown', (event) => {
  if (event.metaKey) {
    return
  }

  if (event.keyCode === 13) {
    var selection = titleElement.value
      .substring(titleElement.selectionStart, titleElement.selectionEnd).trim()
    submit(selection)
    event.preventDefault()
  } else if (event.keyCode >= 37 && event.keyCode <= 40) {
  } else if (event.keyCode >= 48 && event.keyCode <= 57) {
    event.preventDefault()
  } else {
    event.preventDefault()
  }
})

function setError(err) {
  var message

  if (err) {
    if (err.status === 404) {
      message = 'Done! Finished! Nothing to do!'
    } else {
      message = err.message
    }
  } else {
    message = 'Error getting task from server'
  }

  d3.select('#error').append('span').html(message)
}



function loadItem() {
  titleElement.focus()
  // TODO: clear selection!

  const url = `${API_URL}tasks/${TASK}/items/random`
  getJSON(url, (err, nextItem) => {
    if (!nextItem || err) {
      setError(err)
      return
    }

    item = nextItem

    var title = item.data.title
    var src = item.data.image_urls[0].url

    d3.select('#title')
      .attr('value', title)

    d3.select('#image')
      .style('background-image', 'url(' + src + ')')
  })
}

function submit(toponym) {
  var url = `${API_URL}items/${item.provider}/${item.id}`
  var skipped = (toponym.length === 0)

  var body = {
    task: TASK
  }

  if (skipped) {
    body.skipped = true
  } else {
    body.data = {
      toponym: toponym
    }
  }

  postJSON(url, body, (err, results) => {
    if (err) {
      setError(err)
    } else {
      loadItem()
    }
  })
}

loadItem()
