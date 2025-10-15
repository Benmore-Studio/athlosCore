export const mockVideos = [
    {
      id: '1',
      title: 'Pera Sports Highlight: Arsenal vs Chelsea',
      thumbnail: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
      duration: '3:45',
      videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      timelineMarkers: [
        { id: 'm1', timeMillis: 5000, type: 'goal', title: 'Goal', description: 'Superb strike by John Doe' },
        { id: 'm2', timeMillis: 15000, type: 'foul', title: 'Foul', description: 'Rough tackle near the box' },
        { id: 'm3', timeMillis: 30000, type: 'quarter', title: 'End of First Half' },
      ],
      tags: [
        { id: 't1', timeMillis: 6000, x: 32, y: 40, playType: 'Goal', playerName: 'John Doe' },
        { id: 't2', timeMillis: 20000, x: 55, y: 62, playType: 'Foul', playerName: 'Mike Samuels' },
      ],
      teamA: 'Arsenal',
      teamB: 'Chelsea',
      views: 1280,
      likes: 320,
      uploadedAt: '2025-10-12T09:00:00Z',
    },
    {
      id: '2',
      title: 'Pera Sports Highlight: Lakers vs Warriors',
      thumbnail: 'https://i.ytimg.com/vi/1La4QzGeaaQ/hqdefault.jpg',
      duration: '4:15',
      videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      timelineMarkers: [
        { id: 'm1', timeMillis: 8000, type: 'score', title: '3 Pointer', description: 'Amazing shot by LeBron' },
        { id: 'm2', timeMillis: 22000, type: 'timeout', title: 'Timeout', description: 'Golden State calls timeout' },
      ],
      tags: [
        { id: 't1', timeMillis: 10000, x: 45, y: 50, playType: 'Score', playerName: 'LeBron James' },
      ],
      teamA: 'Lakers',
      teamB: 'Warriors',
      views: 980,
      likes: 245,
      uploadedAt: '2025-10-10T12:00:00Z',
    },
    {
      id: '3',
      title: 'Pera Sports Highlight: Nigeria vs Brazil',
      thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
      duration: '5:00',
      videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      timelineMarkers: [
        { id: 'm1', timeMillis: 12000, type: 'goal', title: 'Goal', description: 'Header from Osimhen!' },
        { id: 'm2', timeMillis: 35000, type: 'save', title: 'Goalkeeper Save', description: 'Brilliant save by Ederson' },
      ],
      tags: [
        { id: 't1', timeMillis: 13000, x: 38, y: 48, playType: 'Goal', playerName: 'Victor Osimhen' },
        { id: 't2', timeMillis: 36000, x: 60, y: 40, playType: 'Save', playerName: 'Ederson' },
      ],
      teamA: 'Nigeria',
      teamB: 'Brazil',
      views: 2130,
      likes: 654,
      uploadedAt: '2025-10-08T15:30:00Z',
    },
  ];
  