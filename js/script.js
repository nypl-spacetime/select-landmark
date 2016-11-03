// var API_URL = 'http://brick-by-brick.dev/'
var API_URL = 'http://brick-by-brick.herokuapp.com/'
var TASK_ID = 'select-toponym'

var item = {}
var titleElement = document.getElementById('title')

var examples = [
  [
    'Wanamaker\'s Department Store',
    'Wanamaker\'s Department Store: Broadway and 9th Street'
  ],
  [
    null,
    'Broadway, East Side. Bowling Green to Hudson Bldg.'
  ],
  [
    'Castle Garden', 'Castle Garden, New York. From the Battery. 624'],
  [
    'Richmond Borough National Bank',
    'Richmond Borough National Bank, Stapleton, Staten Island, N.Y.'
  ],
  [
    null,
    'L\'Arrive du Prince Quillaume Henry a Nouvelle York'
  ],
  [
    'City Hall Park',
    'At left, corner of City Hall Park . . . At right, street with church beyond.'
  ],
  [
    null,
    'Stores corner of Broadway and Rector Street'
  ],
  [
    'Bay and Harbour of New-York',
    'View of the Bay and Harbour of New-York, from the Battery'
  ],
  [
    'Lyon Castle',
    'Lyon Castle, Rossville, Staten Island, N.Y.'
  ],
  [
    null,
    'A plan of the city and environs of New York in North America.'
  ],
  [
    'Trinity Church',
    'Trinity Church'
  ]
]

var collections = [
  '812e5770-c60c-012f-7167-58d385a7bc34'
]

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

function formSubmit(event) {
  event.preventDefault()
  submit()
  return false
}
document.getElementById('form').addEventListener('submit', function (event) {
  submit()
  event.preventDefault()
})

titleElement.addEventListener('keydown', function (event) {
  if (event.metaKey) {
    return
  }

  if (event.keyCode === 13) {
    // submit()
    // event.preventDefault()
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

  var url = `${API_URL}tasks/${TASK_ID}/items/random`
  if (collections && collections.length) {
    url += `?collection=${collections.join(',')}`
  }

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

    d3.select('#image a')
      .attr('href', item.data.url)
      .style('background-image', 'url(' + src + ')')
  })
}

function submit() {
  var toponym = titleElement.value
    .substring(titleElement.selectionStart, titleElement.selectionEnd).trim()

  var url = `${API_URL}items/${item.organization.id}/${item.id}`
  var skipped = (toponym.length === 0)

  var body = {
    taskId: TASK_ID
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

d3.select('#examples').selectAll('li').data(examples)
  .enter().append('li')
    .html(function (d) {
      var title = d[1]
      var toponym = d[0]

      if (toponym) {
        var start = title.indexOf(toponym)

        var parts = [
          title.substring(0, start),
          '<span class="selected">' + toponym + '</span>',
          title.substring(start + toponym.length, title.length)
        ]

        return parts.join('')

      } else {
        return title
      }
    })
