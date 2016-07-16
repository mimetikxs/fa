<!DOCTYPE html>
<html lang="en">

	<head>
		<title>Inside Saydnaya</title>

		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">

		<link rel="stylesheet" href="js/lib/videojs/video-js.css">
		<link href="https://fonts.googleapis.com/css?family=Oswald:300,400,700" rel="stylesheet">
		<link rel="stylesheet" href="css/app.css">
		<script src="js/lib/videojs/video.min.js"></script>
	</head>

	<body data-section="explore">

		<div id="content">

			<!-- prison -->

			<div id="layer-prison">
				<div class="gl"></div>
				<div class="labels"></div>

				<div class="title">
					<div>Saydnaya</div>
					<div>صيدنايا</div>
					<div>Inside a Syrian torture prison</div>
				</div>

				<div class="navigation">
					<div class="menu-type">
						<span data-type="location">Explore by location</span>
						<span data-type="witness">Explore by witness</span>
					</div>
					<div class="container">
					</div>
					<div class="ar-watch-videos">
						<div class="folder">شاهد فيديوهات</div>
					</div>
				</div>

			</div>

			<!-- 360 view -->

			<div id="layer-360">
				<div class="gl"></div>
				<div class="labels"></div>
				<div class="title"></div>
				<div class="btn-exit"></div>
				<div class="spinner-wrap">
					<div class="spinner"></div>
				</div>
			</div>

		</div>

		<!-- video overlay -->

		<div id="layer-video">
			<div class="player"></div>

			<div class="controls">
				<div class="info">
					<span class="title">Measuring his face in cell door</span>
					<!-- <span class="witness">Witness A</span>
					<span class="location">Solitary 1</span> -->
				</div>

				<div class="info-arabic">
					<span class="title">قياس وجهه على باب الزنزانة</span>
				</div>

				<div class="btn-next">
					<div class="arrow"></div>
					<div class="label">Guards shortening their sticks</div>
				</div>

				<div class="btn-prev">
					<div class="arrow"></div>
					<div class="label">No echo, cells full of people</div>
				</div>

				<div class="btn-exit"></div>

				<div class="bottom-bar">
					<div class="takeAction">
				        <span>Take Action</span><span>بادر بالتحرك</span>
				    </div>
					<div class="share-social">
						<span class="label">share</span>
						<span class="facebook"></span>
						<span class="twitter"></span>
					</div>
				</div>
			</div>
		</div>

		<!-- intro -->

		<div id="layer-intro">
			<div id="introMessage" class="block">
				<div class="centered">
					<div class="intro-logos">
						<span class="amnesty"></span>
						<span class="fa"></span>
					</div>
					<div class="intro-title">
						<span>Saydnaya</span>
					</div>

					<div class="intro-subtitle">
						<span>Inside a Syrian Torture Prison</span>
					</div>

					<div class="intro-language">
						<div class="en">Content in english and arabic</div>
						<div class="ar">المحتوى باللغتين العربية والإنجليزية</div>
					</div>

					<div class="intro-spinner">
						<div class="spinner"></div>
					</div>
				</div>
			</div>

			<div class="video-container">

			</div>

			<div class="btn-skip">Explore</div>


		</div>

		<!-- top bar -->

		<div id="header">
			<div class="logos">
				<span class="ai"></span>
				<span class="fa"></span>
			</div>

			<div class="takeAction">
				<span>Take Action</span>
				<span>بادر بالتحرك</span>
			</div>

			<div class="mainNav-menu">
				<a class="menuItem" data-target="about" href="en/about.php">
					<span>About</span>
					<span>حول</span>
				</a>
				<a class="menuItem active" data-target="explore">
					<span>Explore</span>
					<span>استكشف</span>
				</a>
			</div>
		</div>

		<div id="footer-desktop" class="share-social">
			<span class="label">share</span>
			<span class="facebook"></span>
			<span class="twitter"></span>
		</div>

		<!-- Scripts -->

		<script src="js/lib/jquery-3.0.0.min.js"></script>
		<script src="js/lib/jquery.transit.min.js"></script>
		<script src="js/lib/dat.gui.js"></script>
		<script src="js/lib/Stats.js"></script>

		<script src="js/lib/player.min.js"></script>
		<script src="js/lib/typed.js"></script>
		<script src="js/lib/threejs/three.js"></script>
		<script src="js/lib/threejs/OBJLoader.js"></script>
        <script src="js/lib/threejs/OrbitControls.js"></script>

		<script src="js/src/FA.js"></script>
		<script src="js/src/sound/BufferLoader.js"></script>
		<script src="js/src/sound/Sound.js"></script>
		<script src="js/src/Utils.js"></script>
		<script src="js/src/Data.js"></script>
		<script src="js/src/Slider.js"></script>
		<script src="js/src/InteractiveItem.js"></script>
		<script src="js/src/stateExplore/LabelsView.js"></script>
		<script src="js/src/stateExplore/BuildingView.js"></script>
		<script src="js/src/stateExplore/MenuView.js"></script>
		<script src="js/src/stateExplore/StateExplore.js"></script>
		<script src="js/src/state360/View360.js"></script>
		<script src="js/src/state360/State360.js"></script>
		<script src="js/src/statePreload/StatePreload.js"></script>
		<script src="js/src/stateVideo/StateVideo.js"></script>
		<script src="js/src/StateIdle.js"></script>
		<script src="js/src/App.js"></script>

	</body>

</html>