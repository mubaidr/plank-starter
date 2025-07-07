"use client";
import React, { useRef, useEffect } from 'react';
import Konva from 'konva';

const HomePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const stage = new Konva.Stage({
        container: containerRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const layer = new Konva.Layer();
      stage.add(layer);

      const colors = ['#D2E5FF', '#A9D1FF', '#7FBFFF', '#54ABFF', '#2997FF'];

      for (let i = 0; i < 10; i++) {
        const shape = new Konva.Circle({
          x: stage.width() * Math.random(),
          y: stage.height() * Math.random(),
          radius: 20 + Math.random() * 30,
          fill: colors[Math.floor(Math.random() * colors.length)],
          draggable: true,
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOpacity: 0.5,
        });
        layer.add(shape);
      }

      const anim = new Konva.Animation(() => {
        layer.children.forEach(child => {
          // @ts-ignore
          child.x(child.x() + (Math.random() - 0.5) * 2);
          // @ts-ignore
          child.y(child.y() + (Math.random() - 0.5) * 2);

          if (child.x() < 0) child.x(0);
          if (child.x() > stage.width()) child.x(stage.width());
          if (child.y() < 0) child.y(0);
          if (child.y() > stage.height()) child.y(stage.height());
        });
      }, layer);

      anim.start();

      return () => {
        anim.stop();
        stage.destroy();
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="absolute inset-0" ref={containerRef} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-5xl font-bold mb-4 text-center">
          Interactive KonvaJS Canvas
        </h1>
        <p className="text-xl text-gray-400 text-center max-w-2xl">
          This is a starter template showcasing an interactive canvas using Konva.js. You can drag and drop the circles on the screen.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
