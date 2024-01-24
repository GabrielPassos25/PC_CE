'use client';

// libs
import { z } from 'zod';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, SyntheticEvent } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

// style
import './styles.css';

// utils
import { ERROR_MESSAGES, LABELS } from '../../utils/texts';
import { PHONE_REGEX } from '../../utils/regex';

// types
import { IPerson, FormInputs } from '../../types/form';
import { Error } from './Error';

const schema = z.object({
  person: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  phone: z.string().refine((value) => PHONE_REGEX.test(value), {
    message: ERROR_MESSAGES.PHONE_INVALID,
  }),
  email: z.string().email(ERROR_MESSAGES.EMAIL_INVALID),
});

export default function MyForm() {
  const [options, setOptions] = useState<IPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<IPerson | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      person: null,
      phone: '',
      email: '',
    },
  });

  const handleSnackbarClose = (event: SyntheticEvent<Element, Event> | Event, reason: SnackbarCloseReason | string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAlertClose = (event: SyntheticEvent<Element, Event>) => {
    handleSnackbarClose(event, '');
  };

  const onSubmit = async (data: FormInputs) => {
    console.log('Form data:', {...data, person: data.person?.id});
    setTimeout(() => { // Simulating API call delay
      setSnackbarOpen(true);
    }, 1000);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (searchQuery) {
      // Evitando que a requisição seja feita a cada letra digitada (debounce)
      timeoutId = setTimeout(() => {
        axios
          .get(`http://localhost:3001/people`, {
            params: {
              name_like: searchQuery,
            },
          
          })
          .then((response) => {
            setOptions(response.data);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }, 500);
    } else {
      // Clear options when the search query is empty
      setOptions([]);
    }

    // Cleanup the timeout on unmount or when searchQuery changes
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchQuery]);

  return (
    <form className="styled-form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="person"
        control={control}
        render={({ field }) => (
          <div className="styled-autocomplete">
            <Autocomplete
              options={options}
              value={selectedValue}
              onChange={(_, data) => {
                field.onChange(data);
                setSelectedValue(data);
              }}
              onInputChange={(event, newInputValue) => {
                setSearchQuery(newInputValue);
              }}
              getOptionLabel={(option) => option?.name || ''}
              renderInput={(params) => <TextField {...params} label={LABELS.PERSON} />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </div>
        )}
      />
      {errors.person && <Error text={errors.person.message}/>}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <input className="styled-input" {...field} placeholder={LABELS.PHONE}/>
        )}
      />
      {errors.phone && <Error text={errors.phone.message}/>}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <input className="styled-input" {...field} placeholder={LABELS.EMAIL} />
        )}
      />
      {errors.email && <Error text={errors.email.message}/>}
      <button className="styled-button" type="submit">{LABELS.SEND}</button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          onClose={handleAlertClose}
        >
          Message sent successfully!
        </MuiAlert>
      </Snackbar>
    </form>
  );
};