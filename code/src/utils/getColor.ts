export function getColor(number: number) {
	if (number <= 1840) return '#000050'
	else if (number <= 1850) return '#00005d'
	else if (number <= 1860) return '#000072'
	else if (number <= 1870) return '#000082'
	else if (number <= 1880) return '#070090'
	else if (number <= 1890) return '#2b008f'
	else if (number <= 1895) return '#430090'
	else if (number <= 1900) return '#5b0090'
	else if (number <= 1905) return '#730090'
	else if (number <= 1915) return '#8e006f'
	else if (number <= 1920) return '#8e0053'
	else if (number <= 1930) return '#900024'
	else if (number <= 1940) return '#8e0005'
	else if (number <= 1950) return '#8f2606'
	else if (number <= 1955) return '#8e4208'
	else if (number <= 1960) return '#906209'
	else if (number <= 1965) return '#917c07'
	else if (number <= 1970) return '#8d9502'
	else if (number <= 1975) return '#719407'
	else if (number <= 1980) return '#579408'
	else if (number <= 1990) return '#2f940a'
	else if (number <= 2000) return '#138e03'
	else return 'black'
}
