import './App.css';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState, useRef } from 'react';
import React from 'react';

//swal for en fin popup
import Swal from 'sweetalert2'




const styles = stylex.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  main: {
    display: 'inline-block',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: '2rem',
    padding: '2rem',
    borderRadius: '5px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'white',
    width: '100vw',
    height: '7vh',
  },
  adminbutton: {
    backgroundColor: 'blue',
    color: 'white',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    ':hover': {
      padding: '0.6rem 1.3rem',
    }
  },
  header: {
    color: 'black',
    fontSize: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  drinklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    gap: '4rem',
  },
  drink: {
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
    ':hover': {
      boxShadow: 'inset 1px 1px 10px #333',
    }
  },
  label: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginLeft: '1rem',
  },
  checkbox: {
    cursor: 'pointer',
  },
  kurv: {
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    width: '100vw',
    fontSize: '0.7rem',
    margin: '0',
  },
  dialog: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dialogli: {
    listStyle: 'none',
    margin: 0,
  },
  dialogelem: {
    paddingLeft: '1rem',
  },
  dialogname: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
  },
  item: {
    borderRadius: '10px',
    padding: '1rem',
    border: '1px solid black',
  },
  close: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid black',
    cursor: 'pointer',
    color: 'black',
    ':hover': {
      padding: ' 0.5rem 0.6rem',
    },
    right: '1rem',
  },
  knapper: {
    display: 'flex',
    justifyContent: 'space-between',
  }
})

function App() {

  const [drinks, setDrinks] = useState([]);
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState(0);

  const dialogref = useRef(null);

  const openDialog = () => {
    dialogref.current.showModal();
  }

  const closeDialog = () => {
    dialogref.current.close();
  }


  const exampledrink = {
    name: 'Cappuchino',
    price: 50,
    tillegg: [{ name: 'melk', price: 10 }, { name: 'sukker', price: 5 }, { name: 'kanel', price: 5 }, { name: 'dobbel', price: 10 }],
  }

  const exampledrink2 = {
    name: 'Espresso',
    price: 40,
    tillegg: [{ name: 'rosakopp', price: 10 }, { name: 'sukker', price: 5 }, { name: 'dobbel', price: 10 }],
  }


  useEffect(() => {
    setDrinks([exampledrink, exampledrink2]);
  }, [])


  const handledrink = (drink) => {
    console.log(drink);

    // alge checkbokser for tillegg
    const addonCheckboxes = drink.tillegg
      .map(
        (tillegg) =>
          `<label class="${stylex.props(styles.label).className}">
          <input type="checkbox" class="${stylex.props(styles.checkbox).className}" 
          value="${tillegg.name}" data-price="${tillegg.price}" />
          ${tillegg.name} (${tillegg.price} kr)
        </label>`
      )
      .join("");


    //swal popup for å velge tillegg
    Swal.fire({
      title: "Velg tillegg",
      html: addonCheckboxes,
      showCancelButton: true,
      confirmButtonText: "Add Selected",
      preConfirm: () => {
        const selected = Array.from(
          Swal.getPopup().querySelectorAll("input[type='checkbox']:checked")
        ).map((checkbox) => ({
          name: checkbox.value,
          price: parseFloat(checkbox.dataset.price),
        }));
        return selected;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Selected addons:", result.value);
        setOrder([...order, { 'name': drink.name, 'price': drink.price, tillegg: result.value }]);
      }
      const drinkPrice = drink.price + result.value.reduce((acc, addon) => acc + addon.price, 0);
      setTotal(total + drinkPrice);
    });
  };


  const handlesubmit = async () => {
    console.log('Kjøpt');
    const payload = { 'order': order, 'total': total };


    try {
      let response = await fetch('http://localhost/DigiPublishing/Del2/script.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      response = await response.json();

      if (response.message === 'Ordre registrert med suksess') {
        closeDialog();
        setOrder([]);
        setTotal(0);
        Swal.fire({
          title: 'Ordre registrert',
          text: 'Ordren er registrert med suksess',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      }
      console.log('Success:', response);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (

    <>
      <div {...stylex.props(styles.navbar)}>
        <h1 {...stylex.props(styles.header)}>DrinkButikken</h1>
        <button {...stylex.props(styles.adminbutton)}>Admin</button>
      </div>

      <div {...stylex.props(styles.kurv)} onClick={openDialog}>
        <h1 {...stylex.props(styles.drink)}>Handlekurv: {total} kr</h1>
      </div>


      <div {...stylex.props(styles.main)}>
        <h1 {...stylex.props(styles.title)}>Drinker:</h1>
        <ul {...stylex.props(styles.drinklist)}>
          {drinks.map((drink, index) => {
            return (
              <li key={index} {...stylex.props(styles.drink)} onClick={() => handledrink(drink)}>
                <h2>{drink.name} : </h2>
                <h2>{drink.price} kr</h2>
              </li>
            )
          })}
        </ul>

      </div>

      <dialog ref={dialogref} >
        <h1>Din handlekurv:</h1>
        <ul {...stylex.props(styles.dialog)}>

          {order.length === 0 && <h1>Ingen varer i handlekurven</h1>}

          {order.map((drink, index) => {
            return (
              <li key={index} {...stylex.props(styles.item)}>
                <h2 {...stylex.props(styles.dialogname)}>{drink.name}</h2>
                <ul {...stylex.props(styles.dialogelem)}>
                  {drink.tillegg.map((tillegg, index) => {
                    return (
                      <li key={index} {...stylex.props(styles.dialogli)}>{tillegg.name}</li>
                    )
                  })}
                </ul>
              </li>
            )
          }
          )}
        </ul>
        <h2>Totalt: {total} kr</h2>
        <div {...stylex.props(styles.knapper)}>
          <button onClick={closeDialog} {...stylex.props(styles.close)}>Lukk</button>
          <button onClick={handlesubmit} {...stylex.props(styles.close)}>Kjøp</button>
        </div>
      </dialog>

    </>
  )
}

export default App;
