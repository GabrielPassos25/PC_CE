// Libs
import { Typography } from '@mui/material';
import React from 'react';

// Renderer
export function Error({text}: {text?: string}){
    return (
        <Typography variant="body2" color="error" align='center' >
            {text}
        </Typography>
    );
}