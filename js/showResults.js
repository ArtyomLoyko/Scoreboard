window.onload = function () {
  const tableScore = document.createElement('table');
  const tableTitle = document.createElement('tr');
  tableScore.appendChild(tableTitle);

  fetch('data/users.json')
    .then((usersData) => {
      return usersData.json();
    })
    .then((usersDataObj) => {
      const userName = document.createElement('th');
      userName.textContent = 'Display Name';
      tableTitle.appendChild(userName);

      const usersIdArr = []; 

      usersDataObj.users.forEach(i => {
        usersIdArr.push(i.uid);
        const td = document.createElement('td');
        td.textContent = `${i.displayName}`;
        const tr = document.createElement('tr');
        tr.appendChild(td);
        tableScore.appendChild(tr);
      });

      return usersIdArr;
    })
    .then((usersIdArr) => {
      return fetch('data/sessions.json')
        .then((sessionsData) => {
          return sessionsData.json();
        })
        .then((sessionsDataObj) => {
          const totalTime = document.createElement('th');
          totalTime.textContent = 'Total Time';
          tableTitle.appendChild(totalTime);
          
          const comparison = document.createElement('th');
          comparison.textContent = 'Comparison';
          tableTitle.appendChild(comparison);

          function makeTable (table, puzzles, rounds) {
            const tableTitle = table.rows[0];

            puzzles.forEach(i => {
              const th = document.createElement('th');
              th.textContent = `${i.name}`;
              tableTitle.insertBefore(th, tableTitle.children[1]);
            });

            for(i = 1; i < table.rows.length; i++) {
              for(j = 0; j < puzzles.length + 2; j++) {
                td = document.createElement('td');
                table.rows[i].appendChild(td);
              }
            }
            
            usersIdArr.forEach(i => { 
              let sumTime = 0;
              const row = usersIdArr.indexOf(i) + 1;

              rounds.forEach(j => {
                const cell = rounds.indexOf(j) + 1;
                
                if (j.solutions[i] && j.solutions[i].correct === 'Correct') {
                  table.rows[row].cells[cell].textContent = `${j.solutions[i].time.$numberLong}`;
                  sumTime += +j.solutions[i].time.$numberLong;
                  
                  table.rows[row].cells[cell].setAttribute('code', `${j.solutions[i].code}`);
                  table.rows[row].cells[cell].style.backgroundColor = 'rgba(30, 255, 0, 0.3)';
                } else {
                  table.rows[row].cells[cell].textContent = '150';
                  sumTime += 150;

                  table.rows[row].cells[cell].setAttribute('code', 'false');
                  table.rows[row].cells[cell].style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                }
              });
              
              table.rows[row].cells[puzzles.length + 1].textContent = `${sumTime}`;

              table.rows[row].cells[puzzles.length + 2].textContent = 'Select';
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              table.rows[row].cells[puzzles.length + 2].appendChild(checkbox);
            });
            
            return table;
          }

          const tableScoreDemo = tableScore.cloneNode(true);

          const table1 = makeTable(tableScore, sessionsDataObj.session1.puzzles, sessionsDataObj.session1.rounds);
          const table2 = makeTable(tableScoreDemo, sessionsDataObj.session2.puzzles, sessionsDataObj.session2.rounds);

          const tablesArr = [table1, table2];

          return tablesArr;
        })
    })
    .then((tables) => {
      const [table1, table2] = tables;
      const body = document.getElementsByTagName('body')[0];
      body.appendChild(table1);
      body.appendChild(table2);

      table2.style.display = 'none';

      const currentSession = document.getElementsByTagName('section')[0];
      const radio = document.getElementsByName('session')[0];
      const lineChartContainer = document.querySelector('.line-chart-container');
      currentSession.addEventListener('change', (e) => {
        if (e.target.className === 'radio-btn') {
          lineChartContainer.style.display = '';
          button2.style.display = 'none';
          table1.style.display = table1.style.display ? '' : 'none';
          table2.style.display = table2.style.display ? '' : 'none';  
        }
      });

      const tooltip = document.querySelector('.tooltip');

      body.addEventListener('mouseover', (e) => {
        if (e.target.hasAttribute('code')) {
          e.target.style.color = 'white';
          e.target.style.backgroundColor = 'grey';
          
          tooltip.textContent = `${e.target.getAttribute('code')}`;
          tooltip.style.display = 'block';
          
          if (e.target.getBoundingClientRect().top + tooltip.offsetHeight + 20 > document.documentElement.clientHeight) {
            tooltip.style.top = e.target.getBoundingClientRect().top - tooltip.offsetHeight - 10 + 'px';
          } else {
            tooltip.style.top = e.target.getBoundingClientRect().top + e.target.offsetHeight + 10 + 'px';
          }

          tooltip.style.left = e.target.getBoundingClientRect().left + (e.target.offsetWidth/2 - tooltip.offsetWidth/2) + 'px';
        }
      });

      body.addEventListener('mouseout', (e) => {
        if (e.target.hasAttribute('code')) {
          e.target.style.color = '';

          if (e.target.textContent === '150') {
            e.target.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
          } else {
            e.target.style.backgroundColor = 'rgba(30, 255, 0, 0.3)';
          }

          tooltip.style.display = 'none';
        }
      });

      const button1 = document.getElementById('button1');
      const button2 = document.getElementById('button2');
      let ctx = null;

      button1.addEventListener('click', () => {
        const colors = ['green', 'yellow', 'red', 'black', 'blue', 'brown', 'grey', 'purple', 'pink', 'orange'];
        let currentTable = table1.style.display ? table2 : table1;
        const column = currentTable.rows[0].cells.length;
        let selectedUsers = [];
        let usersTime = [];
        let puzzlesName = [];
        
        for (i = 1; i < currentTable.rows[0].cells.length - 2; i++) {
          puzzlesName.push(currentTable.rows[0].cells[i].textContent);
        }

        for (i = 1; i < currentTable.rows.length; i++) {
          if (currentTable.rows[i].cells[column - 1].firstElementChild.checked) {
            selectedUsers.push( currentTable.rows[i].cells[0].textContent );
            
            let timeArr = [];
            for (j = 1; j < currentTable.rows[0].cells.length - 2; j++) {
              timeArr.push( currentTable.rows[i].cells[j].textContent );
            }
            usersTime.push(timeArr);
          }
        }
        
        if (selectedUsers.length > 10) {
          alert('You will can select no more 10 users!');
          button2.style.display = 'none';
          lineChartContainer.style.display = 'none';
          return;
        } else if (!selectedUsers.length) {
          alert('You did not select users!');
          return;
        }

        if (ctx) ctx.remove();
        ctx = document.createElement('canvas');
        const lineChartParam = {
          type: 'line',
          data: {
            labels: puzzlesName,
            datasets: []
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  max: 150,
                  beginAtZero: true
                }
              }]
            }
          }
        }
       
        selectedUsers.forEach((item, i) => {
          lineChartParam.data.datasets[i] = {
            label: item,
            data: usersTime[i],
            backgroundColor: [ 'rgba(255, 255, 255, 0)' ],
            borderColor: [ colors[i] ],
            borderWidth: 1
          }
        });

        lineChart = new Chart(ctx, lineChartParam);
        lineChartContainer.appendChild(ctx);

        lineChartContainer.style.display = 'block';
        button2.style.display = 'block';

        button2.addEventListener('click', () => {
          ctx.remove();
          lineChartContainer.style.display = '';
          button2.style.display = 'none';
        });
      });
    });
}