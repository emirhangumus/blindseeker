type Path = {
	isCircular: boolean;
	targetStationId: string;
};

export type PathDict = {
	up: Path | null;
	down: Path | null;
	left: Path | null;
	right: Path | null;
	upRight: Path | null;
	upLeft: Path | null;
	downRight: Path | null;
	downLeft: Path | null;
};

export class Player {
	id: string;
	name: string;
	photo: string;

	constructor(id: string, name: string, photo: string) {
		this.id = id;
		this.name = name;
		this.photo = photo;
	}
}

export class Station {
	id: string;
	availablePaths: PathDict;
	players: Player[];
	stationType: StationType;

	constructor(id: string, availablePaths: PathDict, players: Player[], stationType: StationType) {
		this.id = id;
		this.availablePaths = availablePaths;
		this.players = players;
		this.stationType = stationType;
	}
}

export class ShopItem {
	image: string;
	name: string;
	price: number;
	description: string;

	constructor(image: string, name: string, price: number, description: string) {
		this.image = image;
		this.name = name;
		this.price = price;
		this.description = description;
	}
}

export class Shop {
	name: string;
	items: ShopItem[];

	constructor(name: string, items: ShopItem[]) {
		this.name = name;
		this.items = items;
	}
}

export class ShopStation extends Station {
	shop: Shop;

	constructor(id: string, availablePaths: PathDict, players: Player[], shop: Shop) {
		super(id, availablePaths, players, 'shop');
		this.shop = shop;
	}
}

export class WheelPiece {
	id: string;
	name: string;

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}

export class WheelStation extends Station {
	wheelType: string;
	pieces: WheelPiece[];

	constructor(
		id: string,
		availablePaths: PathDict,
		players: Player[],
		wheelType: 'good' | 'bad',
		pieces: WheelPiece[] = []
	) {
		super(id, availablePaths, players, 'wheel');
		this.wheelType = wheelType;
		this.pieces = pieces;
	}
}

export class BlankStation extends Station {
	constructor(id: string, availablePaths: PathDict, players: Player[]) {
		super(id, availablePaths, players, 'blank');
	}
}

type StationType = 'shop' | 'wheel' | 'blank';

export class PlayerData extends Player {
	currentStation: string;
	gold: number;

	constructor(id: string, name: string, photo: string, currentStation: string, gold: number) {
		super(id, name, photo);
		this.currentStation = currentStation;
		this.gold = gold;
	}
}

export class Move {
	playerId: string;
	direction: Path;

	constructor(playerId: string, direction: Path) {
		this.playerId = playerId;
		this.direction = direction;
	}
}

export class GameMap {
	stations: AllStations[];
	players: PlayerData[];
	moves: Move[];
	currentPlayer: PlayerData | null = null;

	constructor(stations: AllStations[], players: PlayerData[], moves: Move[]) {
		this.stations = stations;
		this.players = players;
		this.moves = moves;
	}
}

export type TGameMap = {
	stations: AllStations[];
	players: PlayerData[];
	moves: Move[];
};

export type AllStations = ShopStation | WheelStation | BlankStation;

export type TTmpPlayer = { id: number, username: string };

export class Game {
	private map: GameMap | null = null;
	private gameId: number;
	private tmpPlayers: TTmpPlayer[] = [];

	constructor(gameInitData: {
		gameId: number;
		blankStationTileCount: number;
		shopTileCount: number;
		goodWheelTileCount: number;
		badWheelTileCount: number;
	} | null = null, gameData: {
		gameMap: GameMap;
		gameId: number;
	} | null = null) {
		if (gameInitData) {
			this.gameId = gameInitData.gameId;
			this.generateGame({
				blankStationTileCount: gameInitData.blankStationTileCount,
				shopTileCount: gameInitData.shopTileCount,
				goodWheelTileCount: gameInitData.goodWheelTileCount,
				badWheelTileCount: gameInitData.badWheelTileCount
			});
			return;
		}
		if (gameData) {
			this.gameId = gameData.gameId;
			this.map = gameData.gameMap;
			return;
		}

		throw new Error('Invalid game initialization');
	}

	getGameId() {
		return this.gameId;
	}

	setGameId(gameId: number) {
		this.gameId = gameId;
	}

	generateGame({
		blankStationTileCount,
		shopTileCount,
		goodWheelTileCount,
		badWheelTileCount
	}: {
		blankStationTileCount: number;
		shopTileCount: number;
		goodWheelTileCount: number;
		badWheelTileCount: number;
	}) {
		const stations: AllStations[] = [];
		const players: PlayerData[] = [];
		const moves: Move[] = [];

		const shop = new Shop('Shop', [
			new ShopItem('item1.png', 'Item 1', 100, 'Item 1 description'),
			new ShopItem('item2.png', 'Item 2', 200, 'Item 2 description'),
			new ShopItem('item3.png', 'Item 3', 300, 'Item 3 description')
		]);

		const wheelPieces = [
			new WheelPiece('piece1', 'Piece 1'),
			new WheelPiece('piece2', 'Piece 2'),
			new WheelPiece('piece3', 'Piece 3')
		];

		for (let i = 0; i < blankStationTileCount; i++) {
			stations.push(new BlankStation(`blank-${i}`, this.initPathDict(), []));
		}

		for (let i = 0; i < shopTileCount; i++) {
			stations.push(new ShopStation(`shop-${i}`, this.initPathDict(), [], shop));
		}

		for (let i = 0; i < goodWheelTileCount; i++) {
			stations.push(
				new WheelStation(`goodWheel-${i}`, this.initPathDict(), [], 'good', wheelPieces)
			);
		}

		for (let i = 0; i < badWheelTileCount; i++) {
			stations.push(new WheelStation(`badWheel-${i}`, this.initPathDict(), [], 'bad', wheelPieces));
		}

		this.bindAllStations(stations);

		// flood fill
		const visited: string[] = [];
		const queue: string[] = [];
		queue.push(stations[0].id);

		while (queue.length > 0) {
			const currentStationId = queue.shift() as string;
			const currentStation = stations.find(
				(station) => station.id === currentStationId
			) as AllStations;

			if (visited.includes(currentStationId)) {
				continue;
			}

			visited.push(currentStationId);

			Object.values(currentStation.availablePaths).forEach((path) => {
				if (path && path.targetStationId !== '') {
					queue.push(path.targetStationId);
				}
			});
		}

		// if there is any station that is not visited, then regenerate the game
		const notVisited = stations.find((station) => !visited.includes(station.id));
		if (notVisited) {
			this.generateGame({
				blankStationTileCount,
				shopTileCount,
				goodWheelTileCount,
				badWheelTileCount
			});
			return;
		}

		this.map = new GameMap(stations, players, moves);
	}

	private initPathDict(): PathDict {
		return {
			up: null,
			down: null,
			left: null,
			right: null,
			upRight: null,
			upLeft: null,
			downRight: null,
			downLeft: null
		};
	}

	private bindAllStations(stations: AllStations[]) {
		stations.forEach((currentStation) => {
			const totalNoNBindedPaths = Object.values(currentStation.availablePaths).filter(
				(path) => path === null
			).length;
			if (totalNoNBindedPaths === 0) return;
			const bindPathCount = randomBetween(1, totalNoNBindedPaths);

			// This is because, if the total number of paths is less than the bind path count, then we can't bind all the paths

			const paths = selectRandomPath(bindPathCount, currentStation.availablePaths);
			const memoStationIds: string[] = [];
			Object.keys(paths).forEach((pathKey) => {
				if (paths[pathKey as keyof PathDict].isCircular) {
					paths[pathKey as keyof PathDict].targetStationId = currentStation.id;
					return;
				}
				let randomStation;
				do {
					randomStation = stations[Math.floor(Math.random() * stations.length)];
				} while (
					randomStation.id === currentStation.id ||
					memoStationIds.includes(randomStation.id)
				);
				memoStationIds.push(randomStation.id);

				let finded = 0;
				// if selected path is have our current station, then ignore it
				Object.values(randomStation.availablePaths).forEach((path) => {
					if (path && path.targetStationId === currentStation.id) {
						finded++;
						return;
					}
				});

				if (finded > 0) {
					return;
				}

				// If the path is circular, then the target station is the current station
				paths[pathKey as keyof PathDict].targetStationId = randomStation.id;
			});

			// remove the values if targetStationId is empty
			Object.keys(paths).forEach((pathKey) => {
				if (paths[pathKey as keyof PathDict].targetStationId === '') {
					delete paths[pathKey as keyof PathDict];
				}
			});

			// Bind the paths to the current station
			currentStation.availablePaths = {
				...currentStation.availablePaths,
				...paths
			};
		});
	}

	startGame() {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		const randomStartStation = this.map.stations[Math.floor(Math.random() * this.map.stations.length)];
		const randomStartPlayer = this.tmpPlayers[Math.floor(Math.random() * this.tmpPlayers.length)];

		this.map.players.push(
			new PlayerData(randomStartPlayer.id.toString(), randomStartPlayer.username, '', randomStartStation.id, 1000)
		);

		// Remove the player from the tmpPlayers
		this.tmpPlayers = this.tmpPlayers.filter((player) => player.id !== randomStartPlayer.id);

		// Set the player to the station
		this.setPlayerToStation(randomStartPlayer.id.toString(), randomStartStation.id);

		// Set the current player
		this.map.currentPlayer = this.map.players[0];

		return this.map;
	}

	setPlayerToStation(playerId: string, stationId: string) {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		const station = this.map.stations.find((station) => station.id === stationId);
		if (!station) {
			throw new Error('Station not found');
		}

		const player = this.map.players.find((player) => player.id === playerId);
		if (!player) {
			throw new Error('Player not found');
		}

		player.currentStation = stationId;
		station.players.push(player);
	}

	removePlayerFromStation(playerId: string, stationId: string) {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		const station = this.map.stations.find((station) => station.id === stationId);
		if (!station) {
			throw new Error('Station not found');
		}

		const player = this.map.players.find((player) => player.id === playerId);
		if (!player) {
			throw new Error('Player not found');
		}

		player.currentStation = '';
		station.players = station.players.filter((player) => player.id !== playerId);
	}

	getPlayerStation(playerId: string): Station | null {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		const player = this.map.players.find((player) => player.id === playerId);
		if (!player) {
			throw new Error('Player not found');
		}

		return this.map.stations.find((station) => station.id === player.currentStation) || null;
	}

	addPlayer(player: TTmpPlayer) {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		this.tmpPlayers.push(player);
	}

	getAvailableActionsForCurrentPlayer(): PathDict {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}

		if (!this.map.currentPlayer) {
			throw new Error('Current player is not set');
		}

		const currentPlayerStation = this.getPlayerStation(this.map.currentPlayer.id);
		if (!currentPlayerStation) {
			throw new Error('Player is not in any station');
		}

		return Object.keys(currentPlayerStation.availablePaths).reduce((acc, pathKey) => {
			const path = currentPlayerStation.availablePaths[pathKey as keyof PathDict];
			if (path) {
				acc[pathKey as keyof PathDict] = path;
			}
			return acc;
		}, {} as PathDict);
	}

	getMap(): GameMap {
		if (!this.map) {
			throw new Error('Game map is not initialized');
		}
		return this.map;
	}

	getDBGameData() {
		const clonedMap = JSON.parse(JSON.stringify(this.map));
		delete clonedMap.currentPlayer;
		delete clonedMap.players;
		return clonedMap;
	}
}

const randomBetween = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1) + min);

const roulette = (chance: number) => Math.random() < chance;

const selectRandomPath = (
	numberOfPaths: number,
	availablePaths: PathDict
): Record<keyof PathDict, Path> => {
	const availablePathKeys = Object.keys(availablePaths).filter(
		(pathKey) => availablePaths[pathKey as keyof PathDict] === null
	);

	if (availablePathKeys.length < numberOfPaths) {
		return {} as Record<keyof PathDict, Path>;
	}

	const cloneAvailablePathKeys = [...availablePathKeys];
	const selectedPaths: (keyof PathDict)[] = [];
	for (let i = 0; i < numberOfPaths; i++) {
		let randomPathKey: keyof PathDict;
		do {
			randomPathKey = cloneAvailablePathKeys[
				Math.floor(Math.random() * cloneAvailablePathKeys.length)
			] as keyof PathDict;
		} while (selectedPaths.includes(randomPathKey as keyof PathDict));
		selectedPaths.push(randomPathKey);

		// Remove the selected path from the available paths
		const index = cloneAvailablePathKeys.indexOf(randomPathKey);
		if (index > -1) {
			cloneAvailablePathKeys.splice(index, 1);
		}

		// For safety, if the selected paths are more than the available paths
		if (selectedPaths.length < 1) break;
	}

	const paths = {} as Record<keyof PathDict, Path>;

	selectedPaths.forEach((pathKey) => {
		paths[pathKey] = {
			isCircular: roulette(0.2),
			targetStationId: ''
		};
	});

	return paths;
};
