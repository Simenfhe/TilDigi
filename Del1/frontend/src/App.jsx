import './App.css';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

//library for datepicker fordi den er fin
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, set } from 'date-fns';

//swal for en fin popup
import Swal from 'sweetalert2'


const styles = stylex.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formelement: {
    display: 'flex',
    flexDirection: 'column',
    margin: '2rem',
    gap: '1rem',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  main: {
    display: 'inline-block',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: '2rem',
    padding: '2rem',
    borderRadius: '30px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',

  },
  input: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid black',
  },
  button: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid black',
    width: '6rem',
    cursor: 'pointer',
    ':hover': {
      border: '1px solid lightblue',
    }
  },
  reset: {
    backgroundColor: 'lightblue',
  },
  submit: {
    backgroundColor: 'lightgreen',
  },
  errorbox: {
    border: '1px solid red',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  success: {
    color: 'green',
  },
  list: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  listelem: {
    display: 'grid',
    gridTemplateColumns: '0.7fr 0.7fr 1fr 0.7fr 0.7fr',
    gap: '1rem',
  },
  listheader: {
    fontWeight: 'bold',
  },
  listcontainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '30px',
  }
})

function App() {

  const [formdata, setFormdata] = useState({
    fornavn: '',
    etternavn: '',
    email: '',
    nummer: '',
    dato: '',
  })

  const [error, setError] = useState('')
  const [etternavnerror, setEtternavnError] = useState(false)
  const [emailerror, setEmailError] = useState(false)
  const [nummererror, setNummerError] = useState(false)
  const [datoerror, setDatoError] = useState(false)

  const [users, setUsers] = useState([])

  const getUsers = async () => {
    const response = await fetch('http://localhost/DigiPublishing/Del1/script.php');
    let data = await response.json();

    data = data.reverse()
    setUsers(data)
    console.log(data)
  }

  // hente brukere fra databasen ved oppstart
  useEffect(() => {
    getUsers();
  }, [])


  const handlechange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value })
  }

  const handleDateChange = (date) => {
    const formattedDate = format(date, 'dd/MM/yyyy'); // Format date to dd/mm/yyyy
    setFormdata({ ...formdata, dato: formattedDate });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    console.log(formdata)

    if (formdata.etternavn.split(' ')[1]) {
      setError('Etternavn kan ikke inneholde mellomrom')
      setEtternavnError(true)
      return
    } else {
      setError('')
      setEtternavnError(false)
    }

    if (formdata.nummer.length !== 8) {
      setError('Nummer må være 8 siffer langt')
      setNummerError(true)
      return
    } else {
      setError('')
      setNummerError(false)
    }

    try {
      const response = await fetch('http://localhost/DigiPublishing/Del1/script.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formdata),
      });

      const result = await response.json();
      console.log('Success:', JSON.stringify(result));

      //sjekke om det er en feil i backend og sette error state

      if (result.message === "Feil format på email") {
        setError('Feil format på email')
        setEmailError(true)
      } else {
        setError('')
        setEmailError(false)
      }

      if (result.message === "Nummer må begynne på 9 eller 4" || result.message === "Nummeret er ikke gyldig") {
        setError(result.message)
        setNummerError(true)
      } else {
        setNummerError(false)
        setError('')
      }

      if (result.message === "Du må være 16 år eller eldre for å registrere deg") {
        setError(result.message)
        setDatoError(true)
      } else {
        setDatoError(false)
        setError('')
      }

      if (result.message === "Registrering vellykket") {
        Swal.fire({
          title: 'Registrering vellykket!',
          text: 'Du er nå registrert',
          icon: 'success',
          confirmButtonText: 'Ok'
        })

        // hente users på nytt for å oppdatere listen med nyeste bruker
        // hadde dette vært ekte med mange brukere ville jeg heller bare hentet den nyeste, eller lagt den til fra frontend
        getUsers();
      }


    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  }

  const handlereset = () => {
    setFormdata({
      fornavn: '',
      etternavn: '',
      email: '',
      nummer: '',
      dato: '',
    })

    setError('')
    setEtternavnError(false)
    setEmailError(false)
    setNummerError(false)
    setDatoError(false)
  }

  return (

    <>

      <div {...stylex.props(styles.main)}>
        <h1 {...stylex.props(styles.title)}>Registreringsskjema</h1>
        <form onSubmit={handlesubmit} >
          <div {...stylex.props(styles.formelement)}>
            <label htmlFor="fornavn">Fornavn</label>
            <input type="text" name='fornavn' required {...stylex.props(styles.input)} onChange={handlechange} value={formdata.fornavn} placeholder='Knut' />
          </div>

          <div {...stylex.props(styles.formelement)}>
            <label htmlFor="etternavn">Etternavn</label>
            <input type="text" name='etternavn' required {...stylex.props(styles.input, etternavnerror && styles.errorbox)} onChange={handlechange} value={formdata.etternavn} placeholder='Bjørnson' />
          </div>

          <div {...stylex.props(styles.formelement)}>
            <label htmlFor="email">Email</label>
            {/* error håndtering på både frontend og backend siden det er innebygd i html5 */}
            <input type="email" name='email' {...stylex.props(styles.input, emailerror && styles.errorbox)} onChange={handlechange} value={formdata.email} placeholder='knut@gmail.com' />
          </div>

          <div {...stylex.props(styles.formelement)}>
            <label htmlFor="nummer">Telefonnummer</label>
            <input type="tel" name='nummer' {...stylex.props(styles.input, nummererror && styles.errorbox)} onChange={handlechange} value={formdata.nummer} placeholder='91234567' />
          </div>

          <div {...stylex.props(styles.formelement)}>
            <label htmlFor="dato">Fødselsdato</label>
            <DatePicker
              selected={formdata.dato ? new Date(formdata.dato.split('/').reverse().join('-')) : null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Velg dato"
              className={`${stylex.props(styles.input).className} ${datoerror ? stylex.props(styles.errorbox).className : ''}`}
            />
          </div>

          {error && <p {...stylex.props(styles.error)}>{error}</p>}


          <div {...stylex.props(styles.buttons)}>
            <input type="reset" value={"Reset"} {...stylex.props(styles.button, styles.reset)} onClick={handlereset} />
            <input type="submit" value={"Submit"} {...stylex.props(styles.button, styles.submit)} />
          </div>

        </form>




      </div>

      <div {...stylex.props(styles.listcontainer)}>
        <ul {...stylex.props(styles.list)}>
          <li{...stylex.props(styles.listheader, styles.listelem)}>
            <li>Fornavn</li>
            <li>Etternavn</li>
            <li>Epost</li>
            <li>Telefon</li>
            <li>Fødselsdato</li>
          </li>
          {users.map((user, index) => (
            <li key={index} {...stylex.props(styles.listelem)}>
              <li>{user.fornavn}</li>
              <li>{user.etternavn}</li>
              <li>{user.epost}</li>
              <li>{user.telefon}</li>
              <li>{user.fødselsdato}</li>
            </li>
          ))}
        </ul>
      </div>

    </>
  )
}

export default App;
