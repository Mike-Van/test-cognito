import React, { useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Auth } from 'aws-amplify';

const Home = () => {
	const [user, setUser] = React.useState(null);
	console.log('🚀 ~ file: index.tsx:7 ~ Home ~ user:', user);

	useEffect(() => {
		Auth.currentAuthenticatedUser().then(setUser).catch(console.error);
	}, []);

	return (
		<Stack
			sx={{
				gap: 2,
				width: '100vw',
				height: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<img src="/favicon.ico" />
			{user ? (
				<>
					<Typography variant="body1">SIGN OUT OF FRANCHISE (SST)</Typography>
					<Button
						variant="contained"
						color="error"
						onClick={() => {
							Auth.signOut();
						}}
					>
						Sign Out
					</Button>
				</>
			) : (
				<>
					<Typography variant="body1">SIGN IN TO FRANCHISE (SST)</Typography>
					<Button
						variant="contained"
						onClick={() => {
							Auth.federatedSignIn({ provider: 'Google' as any });
						}}
					>
						Sign In
					</Button>
				</>
			)}
		</Stack>
	);
};

export default Home;
