const dynamic = async () => {
  {
    const pluginName = process.argv[2];

    if (!pluginName) {
      console.log("Please provide a plugin name");
      process.exit(1);
    }

    try {
      // Динамический импорт из поддиректории plugins/
      const plugin = await import(`./plugins/${pluginName}.js`);

      if (typeof plugin.run !== "function") {
        console.log("Plugin not found");
        process.exit(1);
      }

      const result = plugin.run();
      console.log(result);

    } catch (err) {
      console.log("Plugin not found");
      process.exit(1);
    }
  };
}

await dynamic();
