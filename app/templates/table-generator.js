const pug = require('pug');

const template = `
table(class='table-striped')
    thead
       - var n = 0
       tr
           th &nbsp;
           while n < stateCount
                th= n++
    tbody
        each row in table
          tr
             th= row[0]
             each sym in row[1]
               td= sym
`;

module.exports =  pug.compile(template);